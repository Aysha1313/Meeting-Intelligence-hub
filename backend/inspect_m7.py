import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meeting_hub.db")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("\n--- Meeting 7 Transcript Content ---")
    res = conn.execute(text("SELECT raw_content FROM transcripts WHERE meeting_id = 7"))
    row = res.fetchone()
    if row:
        print(f"Content Length: {len(row[0])}")
        print("Preview:")
        print(row[0][:500])
    else:
        print("No transcript found for meeting 7.")
