import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meeting_hub.db")
print(f"Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("\n--- Meetings ---")
    res = conn.execute(text("SELECT id, project_name FROM meetings"))
    for row in res:
        print(row)

    print("\n--- Transcripts ---")
    res = conn.execute(text("SELECT id, meeting_id, filename, status FROM transcripts"))
    for row in res:
        print(row)
    
    print("\n--- Checking specifically for meeting 7 ---")
    res = conn.execute(text("SELECT count(*) FROM transcripts WHERE meeting_id = 7"))
    print(f"Count for meeting 7: {res.scalar()}")
