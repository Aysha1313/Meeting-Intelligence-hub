# Meeting Intelligence Hub

A smart system that converts raw meeting transcripts (.txt/.vtt) into structured insights by automatically extracting key decisions and action items. It includes a contextual chatbot that allows users to query transcripts and get accurate answers.

## Tech Stack

### Frameworks & Libraries
- **Frontend**: React.js with Vite, Tailwind CSS (implied by typical Vite setups, or standard CSS), Lucide React (Icons), Recharts (Data Visualization).
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
