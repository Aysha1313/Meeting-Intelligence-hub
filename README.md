# Meeting Intelligence Hub

## Brief Description
Meeting Intelligence Hub is a smart system that converts raw meeting transcripts (.txt/.vtt) into structured insights by automatically extracting key decisions, action items, and sentiment analysis. It features a comprehensive dashboard with data visualization and an AI-powered contextual chatbot that allows users to query their transcripts and retrieve accurate, context-aware answers.

## Problem Statement & Solution
**The Problem:**
Reading through lengthy meeting transcripts or re-watching recordings to find specific decisions, action items, or contextual details is time-consuming and inefficient. Critical information often gets lost, and cross-referencing multiple meetings can be difficult.

**How This Project Solves It:**
This project addresses these challenges by automating the extraction of key meeting outcomes. It uses generative AI (Mistral AI) to process text and video transcripts, extract structured action items and decisions, and generate a searchable vector database (ChromaDB) of the meeting content. Users can instantly access summarized intelligence, view analytics via a clean React dashboard, and use the integrated chatbot to ask specific questions about what was discussed, saving countless hours of manual review.

###demo video
https://www.loom.com/share/9b2abd77b4d443fd93ce994eb92aa7ba

## Tech Stack

### Frameworks & Libraries
- **Frontend**: React.js with Vite, Tailwind CSS, Lucide React (Icons), Recharts (Data Visualization).
- **Backend**: FastAPI (Python), SQLAlchemy (ORM).

### Databases
- **Relational Database**: PostgreSQL (or SQLite as a default fallback for local development).
- **Vector Database**: ChromaDB (for storing document embeddings).

### APIs & Third-Party Tools
- **Mistral AI**: Used for generating insights, action items, and powering the chatbot.
- **Sentence Transformers**: Specifically using open-source Hugging Face models for text embeddings.

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js (v16+)
- A Mistral API Key

### 1. Clone the project
```bash
git clone <repository_url>
cd meeting-intelligence-hub
```

### 2. Backend Setup
Navigate to the backend directory, set up a virtual environment, and install the dependencies:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the required environment variables:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
# Optional: Provide a PostgreSQL URL, defaults to local SQLite if omitted
DATABASE_URL=sqlite:///./meeting_hub.db
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload
```
The backend API will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will typically be accessible at `http://localhost:5173`.
