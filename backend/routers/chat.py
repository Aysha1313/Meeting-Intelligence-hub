from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from services.vector_store import search
from services.mistral_service import answer_question
import schemas

router = APIRouter(prefix="/chat", tags=["Chatbot"])

# Keywords that signal the user is asking about decisions
DECISION_KEYWORDS = [
    "decision", "decisions", "decided", "agreed", "concluded",
    "resolved", "approved", "rejected", "outcome", "outcomes",
    "what was decided", "what did they decide", "what was agreed"
]

# Keywords that signal the user is asking about action items
ACTION_KEYWORDS = [
    "action", "actions", "action item", "task", "tasks", "todo",
    "assigned", "responsibility", "who is responsible", "next step",
    "next steps", "follow up", "follow-up", "deadline", "due"
]


def _question_matches(question: str, keywords: list) -> bool:
    q = question.lower()
    return any(kw in q for kw in keywords)


def _build_db_context(meeting_id: int, db: Session, question: str) -> list:
    """
    Pull structured data (decisions / action items) directly from the SQL DB
    and format them as context chunks so the AI can cite them accurately.
    """
    extra_chunks = []

    transcripts = db.query(models.Transcript).filter(
        models.Transcript.meeting_id == meeting_id
    ).all()

    for t in transcripts:
        decisions = db.query(models.Decision).filter(
            models.Decision.transcript_id == t.id
        ).all()

        if decisions:
            block = "\n".join([
                f"- Decision: {d.decision_text}" +
                (f"\n  Context: {d.context}" if d.context else "")
                for d in decisions
            ])
            extra_chunks.append({
                "text": f"[Decisions extracted from transcript]\n{block}",
                "source": t.filename,
                "meeting_id": meeting_id,
                "transcript_id": t.id
            })

        actions = db.query(models.ActionItem).filter(
            models.ActionItem.transcript_id == t.id
        ).all()

        if actions:
            block = "\n".join([
                f"- Task: {a.task_description} | Owner: {a.responsible_person} | Due: {a.due_date}"
                for a in actions
            ])
            extra_chunks.append({
                "text": f"[Action items extracted from transcript]\n{block}",
                "source": t.filename,
                "meeting_id": meeting_id,
                "transcript_id": t.id
            })

    return extra_chunks


@router.post("/", response_model=schemas.ChatResponse)
def chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    meeting_id = int(request.meeting_id) if request.meeting_id else None

    # 1. Check transcripts exist
    transcript_count = db.query(models.Transcript).filter(
        models.Transcript.meeting_id == meeting_id
    ).count()

    if transcript_count == 0:
        return schemas.ChatResponse(
            answer="I couldn't find any transcripts for this meeting. Please upload one before asking questions.",
            sources=[]
        )

    # 2. Pull structured DB context (decisions / actions) directly
    db_chunks = _build_db_context(meeting_id, db, request.question)

    # 3. Vector search for general context
    vector_chunks = search(query=request.question, meeting_id=meeting_id, n_results=5)

    with open("chat_debug.log", "a") as f:
        f.write(
            f"RECV: q='{request.question}' meeting_id={meeting_id} "
            f"vector_chunks={len(vector_chunks)} db_chunks={len(db_chunks)}\n"
        )

    # 4. If no context at all, give a clear status message
    if not vector_chunks and not db_chunks:
        processing_count = db.query(models.Transcript).filter(
            models.Transcript.meeting_id == meeting_id,
            models.Transcript.status == "processing"
        ).count()

        if processing_count > 0:
            return schemas.ChatResponse(
                answer="I'm still analysing the transcripts. Please wait a moment and try again.",
                sources=[]
            )

        return schemas.ChatResponse(
            answer="I found transcripts for this meeting but couldn't find information relevant to your question.",
            sources=[]
        )

    # 5. Merge: structured DB chunks first (higher priority), then vector chunks
    all_chunks = db_chunks + vector_chunks

    answer = answer_question(request.question, all_chunks)

    sources = [
        {
            "meeting_id": c["meeting_id"],
            "filename": c["source"],
            "excerpt": c["text"][:200] + "..."
        }
        for c in all_chunks
    ]

    return schemas.ChatResponse(answer=answer, sources=sources)