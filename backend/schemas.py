from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MeetingCreate(BaseModel):
    project_name: str
    meeting_date: Optional[datetime] = None

class TranscriptSummary(BaseModel):
    id: int
    filename: str
    word_count: int
    speakers: List[str]
    status: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

class MeetingResponse(BaseModel):
    id: int
    project_name: str
    meeting_date: datetime
    created_at: datetime
    transcript_count: int = 0
    total_action_items: int = 0
    overall_sentiment: Optional[float] = None
    transcripts: List[TranscriptSummary] = []
    class Config:
        from_attributes = True

class ActionItemResponse(BaseModel):
    id: int
    responsible_person: str
    task_description: str
    due_date: Optional[str]
    class Config:
        from_attributes = True

class DecisionResponse(BaseModel):
    id: int
    decision_text: str
    context: Optional[str]
    class Config:
        from_attributes = True

class SentimentResponse(BaseModel):
    speaker: str
    segment_text: str
    sentiment: str
    score: float
    segment_index: int
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str
    meeting_id: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]