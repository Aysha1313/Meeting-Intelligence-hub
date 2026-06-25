import sqlite3
import os

DB_PATH = "backend/meeting_hub.db"

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("--- Meetings ---")
    cursor.execute("SELECT id, project_name FROM meetings")
    meetings = cursor.fetchall()
    for m in meetings:
        print(f"ID: {m[0]}, Project: {m[1]}")

    print("\n--- Transcripts ---")
    cursor.execute("SELECT id, meeting_id, filename, status FROM transcripts")
    transcripts = cursor.fetchall()
    for t in transcripts:
        print(f"ID: {t[0]}, Meeting ID: {t[1]}, Filename: {t[2]}, Status: {t[3]}")
    
    # Specific check for meeting 7
    cursor.execute("SELECT * FROM transcripts WHERE meeting_id = 7")
    m7 = cursor.fetchall()
    print(f"\n--- Specific Check for Meeting 7 ---")
    print(f"Number of transcripts for meeting 7: {len(m7)}")
    for t in m7:
        print(t)


if __name__ == "__main__":
    check_db()
