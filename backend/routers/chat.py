from fastapi import APIRouter
from services.vector_store import search
from services.mistral_service import answer_question
import schemas

router = APIRouter(prefix="/chat", tags=["Chatbot"])

@router.post("/", response_model=schemas.ChatResponse)
def chat(request: schemas.ChatRequest):
    chunks = search(query=request.question, meeting_id=request.meeting_id, n_results=5)
    print(f"\n--- CHAT RECV: {request.question} (meeting_id={request.meeting_id}) | Chunks found: {len(chunks)} ---")
    if not chunks:
        return schemas.ChatResponse(
            answer="I couldn't find any relevant information in the uploaded transcripts.",
            sources=[]
        )
    answer = answer_question(request.question, chunks)
    sources = [
        {"meeting_id": c["meeting_id"], "filename": c["source"], "excerpt": c["text"][:200] + "..."}
        for c in chunks
    ]
    return schemas.ChatResponse(answer=answer, sources=sources)