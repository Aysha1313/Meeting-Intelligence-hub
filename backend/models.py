from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), nullable=False)
    meeting_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    transcripts = relationship("Transcript", back_populates="meeting")

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))
    filename = Column(String(255))
    file_type = Column(String(10))
    raw_content = Column(Text)
    word_count = Column(Integer)
    speakers = Column(JSON)
    status = Column(String(20), default="processing")  # processing | done | failed
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    meeting = relationship("Meeting", back_populates="transcripts")
    action_items = relationship("ActionItem", back_populates="transcript")
    decisions = relationship("Decision", back_populates="transcript")
    sentiments = relationship("SentimentSegment", back_populates="transcript")

class ActionItem(Base):
    __tablename__ = "action_items"
    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))
    responsible_person = Column(String(255))
    task_description = Column(Text)
    due_date = Column(String(100))
    transcript = relationship("Transcript", back_populates="action_items")

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))
    decision_text = Column(Text)
    context = Column(Text)
    transcript = relationship("Transcript", back_populates="decisions")

class SentimentSegment(Base):
    __tablename__ = "sentiment_segments"
    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))
    speaker = Column(String(255))
    segment_text = Column(Text)
    sentiment = Column(String(20))
    score = Column(Float)
    segment_index = Column(Integer)
    transcript = relationship("Transcript", back_populates="sentiments")