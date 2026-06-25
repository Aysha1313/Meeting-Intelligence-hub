import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import chromadb
from chromadb.utils import embedding_functions
from services.parser import chunk_text

# Load environment variables
load_dotenv()

# Setup Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./meeting_hub.db")
print(f"Connecting to Database: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

# Setup ChromaDB
CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
print(f"Connecting to ChromaDB at: {CHROMA_DIR}")
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="transcripts",
    embedding_function=embedding_fn
)

def sync():
    with engine.connect() as conn:
        # Get all transcripts that are 'done'
        print("Fetching completed transcripts from database...")
        res = conn.execute(text("SELECT id, meeting_id, filename, raw_content FROM transcripts WHERE status = 'done'"))
        transcripts = res.fetchall()
        
        print(f"Found {len(transcripts)} completed transcripts.")
        
        for t_id, m_id, filename, content in transcripts:
            # Check if already in Chroma
            # A simple way is to check by transcript_id in metadata
            existing = collection.get(where={"transcript_id": t_id})
            if existing and existing['ids']:
                print(f"Transcript {t_id} (Meeting {m_id}) already in ChromaDB. Skipping.")
                continue
            
            print(f"Adding Transcript {t_id} (Meeting {m_id}, {filename}) to ChromaDB...")
            chunks = chunk_text(content)
            if not chunks:
                continue
                
            ids = [f"t{t_id}_c{i}" for i in range(len(chunks))]
            metadatas = [
                {"transcript_id": t_id, "meeting_id": m_id, "source": filename, "chunk_index": i}
                for i in range(len(chunks))
            ]
            
            collection.add(documents=chunks, ids=ids, metadatas=metadatas)
            print(f"  Added {len(chunks)} chunks.")

    print("\nSync complete!")
    print(f"Total items in ChromaDB now: {collection.count()}")

if __name__ == "__main__":
    # Ensure we can import services.parser
    import sys
    sys.path.append(os.getcwd())
    sync()
