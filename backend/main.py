from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import engine, Base
import models
from routers import transcripts, meetings, chat
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Intelligence Hub", version="1.0.0")

origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "")
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