from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.parser import parse_txt, parse_vtt, count_words, chunk_text
from services.mistral_service import extract_decisions_and_actions, analyze_sentiment
from services.vector_store import add_chunks
from typing import List
import os

router = APIRouter(prefix="/transcripts", tags=["Transcripts"])
ALLOWED_EXTENSIONS = {'txt', 'vtt'}


def run_ai_extraction(transcript_id: int, clean_text: str, speakers: list, meeting_id: int, filename: str):
    """
    FIX #2 — Run AI extraction in the background.
    This means the upload API returns instantly (no timeout risk),
    and Mistral processes in the background.
    Status goes from 'processing' → 'done' or 'failed'.
    """
    from database import SessionLocal
    db = SessionLocal()
    try:
        # 1. Add to vector store for chatbot
        chunks = chunk_text(clean_text)
        add_chunks(transcript_id, meeting_id, filename, chunks)
        db.commit() # Save progress

        # 2. Extract decisions + action items
        extracted = extract_decisions_and_actions(clean_text)
        for d in extracted.get("decisions", []):
            db.add(models.Decision(
                transcript_id=transcript_id,
                decision_text=d["decision_text"],
                context=d.get("context", "")
            ))
        for a in extracted.get("action_items", []):
            db.add(models.ActionItem(
                transcript_id=transcript_id,
                responsible_person=a["responsible_person"],
                task_description=a["task_description"],
                due_date=a.get("due_date", "Not specified")
            ))
        db.commit() # Save progress

        # 3. Sentiment analysis
        sentiment_segments = analyze_sentiment(clean_text, speakers)
        for i, seg in enumerate(sentiment_segments):
            db.add(models.SentimentSegment(
                transcript_id=transcript_id,
                speaker=seg["speaker"],
                segment_text=seg["segment_text"],
                sentiment=seg["sentiment"],
                score=seg["score"],
                segment_index=i
            ))
        db.commit() # Save progress

        # 4. Mark as done
        transcript = db.query(models.Transcript).filter(models.Transcript.id == transcript_id).first()
        if transcript:
            transcript.status = "done"
        db.commit()

    except Exception as e:
        print(f"AI extraction failed for transcript {transcript_id}: {e}")
        transcript = db.query(models.Transcript).filter(models.Transcript.id == transcript_id).first()
        if transcript:
            transcript.status = "failed"
        db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=schemas.TranscriptSummary)
async def upload_transcript(
    file: UploadFile = File(...),
    meeting_id: int = Form(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    ext = file.filename.split('.')[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. Only .txt and .vtt files are allowed."
        )

    content = await file.read()
    try:
        # Try UTF-8 first
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        try:
            # Common for Windows Notepad (with BOM)
            text = content.decode('utf-16')
        except UnicodeDecodeError:
            try:
                # Common for some legacy systems
                text = content.decode('latin-1')
            except UnicodeDecodeError:
                # Last resort, replace failing characters
                text = content.decode('utf-8', errors='replace')

    if ext == 'vtt':
        clean_text, speakers = parse_vtt(text)
    else:
        clean_text, speakers = parse_txt(text)

    word_count = count_words(clean_text)

    # Save transcript immediately — return to user right away
    transcript = models.Transcript(
        meeting_id=meeting_id,
        filename=file.filename,
        file_type=ext,
        raw_content=clean_text,
        word_count=word_count,
        speakers=speakers,
        status="processing"
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)

    # AI runs in background — no timeout risk
    background_tasks.add_task(
        run_ai_extraction,
        transcript.id, clean_text, speakers, meeting_id, file.filename
    )

    return schemas.TranscriptSummary(
        id=transcript.id,
        filename=transcript.filename,
        word_count=transcript.word_count,
        speakers=transcript.speakers,
        status=transcript.status,
        uploaded_at=transcript.uploaded_at
    )


@router.get("/{transcript_id}/status")
def get_status(transcript_id: int, db: Session = Depends(get_db)):
    """Poll this endpoint from frontend to know when AI is done."""
    t = db.query(models.Transcript).filter(models.Transcript.id == transcript_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {"status": t.status}


@router.get("/{transcript_id}/actions", response_model=List[schemas.ActionItemResponse])
def get_action_items(transcript_id: int, db: Session = Depends(get_db)):
    return db.query(models.ActionItem).filter(models.ActionItem.transcript_id == transcript_id).all()


@router.get("/{transcript_id}/decisions", response_model=List[schemas.DecisionResponse])
def get_decisions(transcript_id: int, db: Session = Depends(get_db)):
    return db.query(models.Decision).filter(models.Decision.transcript_id == transcript_id).all()


@router.get("/{transcript_id}/sentiment", response_model=List[schemas.SentimentResponse])
def get_sentiment(transcript_id: int, db: Session = Depends(get_db)):
    return db.query(models.SentimentSegment).filter(
        models.SentimentSegment.transcript_id == transcript_id
    ).order_by(models.SentimentSegment.segment_index).all()