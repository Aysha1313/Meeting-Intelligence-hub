from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from database import engine, Base
import models
from routers import transcripts, meetings, chat
import os
import threading
import logging

logger = logging.getLogger("uvicorn.error")

def reindex_on_startup():
    """Re-index all transcripts into ChromaDB on startup (runs in background thread)."""
    try:
        logger.info("Starting ChromaDB re-indexing on startup...")
        from reindex import sync
        sync()
        logger.info("ChromaDB re-indexing complete.")
    except Exception as e:
        logger.error(f"ChromaDB re-indexing failed (chat may not work): {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Start reindex in background so app boots instantly
    thread = threading.Thread(target=reindex_on_startup, daemon=True)
    thread.start()
    yield
    # Shutdown — nothing to clean up

app = FastAPI(title="Meeting Intelligence Hub", version="1.0.0", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "https://meeting-intelligence-hub-tau.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler — never crash the app silently
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server error: {str(exc)}"}
    )

app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(chat.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Meeting Intelligence Hub running"}