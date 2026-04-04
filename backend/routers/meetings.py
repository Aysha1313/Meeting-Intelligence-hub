from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models, schemas
from typing import List

router = APIRouter(prefix="/meetings", tags=["Meetings"])

from datetime import datetime

@router.post("/", response_model=schemas.MeetingResponse)
def create_meeting(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    db_meeting = models.Meeting(
        project_name=meeting.project_name, 
        meeting_date=meeting.meeting_date or datetime.utcnow()
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return _enrich(db_meeting, db)

@router.get("/", response_model=List[schemas.MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    return [_enrich(m, db) for m in db.query(models.Meeting).all()]

@router.get("/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return _enrich(m, db)

def _enrich(meeting, db):
    ids = [t.id for t in meeting.transcripts]
    action_count = db.query(models.ActionItem).filter(
        models.ActionItem.transcript_id.in_(ids)
    ).count() if ids else 0
    avg_sentiment = None
    if ids:
        result = db.query(func.avg(models.SentimentSegment.score)).filter(
            models.SentimentSegment.transcript_id.in_(ids)
        ).scalar()
        avg_sentiment = round(float(result), 2) if result else None
    return {
        "id": meeting.id,
        "project_name": meeting.project_name,
        "meeting_date": meeting.meeting_date,
        "created_at": meeting.created_at,
        "transcript_count": len(meeting.transcripts),
        "total_action_items": action_count,
        "overall_sentiment": avg_sentiment,
        "transcripts": meeting.transcripts
    }