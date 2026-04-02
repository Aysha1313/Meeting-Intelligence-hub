import os
import json
import time
from mistralai import Mistral
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

# Use mistral-small — cheaper, still very capable for extraction tasks
# Switch to mistral-large-latest only if quality is not good enough
MODEL = "mistral-small-latest"


def _call_mistral(prompt: str, retries: int = 3) -> str:
    """
    FIX #1 — Retry with exponential backoff.
    Mistral has frequent outages (326+ in 11 months).
    This retries 3 times: waits 1s, 2s, 4s between attempts.
    """
    last_error = None
    for attempt in range(retries):
        try:
            response = client.chat.complete(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            last_error = e
            if attempt < retries - 1:
                wait = 2 ** attempt  # 1s, 2s, 4s
                print(f"Mistral call failed (attempt {attempt+1}). Retrying in {wait}s... Error: {e}")
                time.sleep(wait)
            else:
                print(f"Mistral call failed after {retries} attempts: {e}")

    raise HTTPException(
        status_code=503,
        detail="AI service is temporarily unavailable. Please try again in a few minutes."
    )


def _parse_json(raw: str) -> any:
    """Strip markdown fences and parse JSON safely."""
    clean = raw.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)


def extract_decisions_and_actions(transcript_text: str) -> dict:
    prompt = f"""
You are an expert meeting analyst. Read this meeting transcript carefully.

Extract:
1. DECISIONS — things the team agreed on or concluded
2. ACTION ITEMS — specific tasks assigned to someone

For each action item extract:
- responsible_person: who is responsible
- task_description: what they need to do
- due_date: when (use "Not specified" if unclear)

Return ONLY valid JSON, nothing else:
{{
  "decisions": [
    {{"decision_text": "...", "context": "..."}}
  ],
  "action_items": [
    {{"responsible_person": "...", "task_description": "...", "due_date": "..."}}
  ]
}}

TRANSCRIPT:
{transcript_text[:8000]}
"""
    raw = _call_mistral(prompt)
    return _parse_json(raw)


def analyze_sentiment(transcript_text: str, speakers: list) -> list:
    prompt = f"""
You are a sentiment analyst for business meetings.
Speakers: {', '.join(speakers) if speakers else 'Unknown'}

Divide the transcript into logical segments (~5 minutes each).
For each segment identify:
- speaker: who is speaking (or "Multiple")
- sentiment: one of "positive", "neutral", "negative", "conflict"
- score: float -1.0 to 1.0
- segment_text: 1-2 sentence summary of what was said

Return ONLY a valid JSON array, nothing else:
[
  {{"speaker": "...", "sentiment": "...", "score": 0.0, "segment_text": "..."}}
]

TRANSCRIPT:
{transcript_text[:6000]}
"""
    raw = _call_mistral(prompt)
    return _parse_json(raw)


def answer_question(question: str, context_chunks: list) -> str:
    context_str = "\n\n---\n\n".join([
        f"[Source: Meeting {c['meeting_id']}, File: {c['source']}]\n{c['text']}"
        for c in context_chunks
    ])
    
    prompt = f"""
You are an intelligent meeting assistant. Use the following excerpts from meeting transcripts to answer the question as accurately as possible.

INSTRUCTIONS:
1. Answer the question clearly and concisely.
2. Cite the source (meeting ID/filename) where the information was found.
3. If the answer is absolutely not present in the provided context, ONLY then say: "I couldn't find that information in the available transcripts."
4. Be helpful. If a mention is found (e.g., "X is used for Y"), use it as the answer even if it's brief.

QUESTION: {question}

CONTEXT:
{context_str}
"""
    print(f"\n--- DEBUG: QA PROMPT ---\n{prompt}\n----------------------\n")
    answer = _call_mistral(prompt)
    print(f"\n--- DEBUG: QA RESPONSE ---\n{answer}\n----------------------\n")
    return answer