import chromadb
import os
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv()

CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="transcripts",
    embedding_function=embedding_fn
)

def add_chunks(transcript_id: int, meeting_id: int, filename: str, chunks: list):
    if not chunks:
        return
    ids = [f"t{transcript_id}_c{i}" for i in range(len(chunks))]
    metadatas = [
        {"transcript_id": transcript_id, "meeting_id": meeting_id, "source": filename, "chunk_index": i}
        for i in range(len(chunks))
    ]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)

def search(query: str, meeting_id: int = None, n_results: int = 5) -> list:
    where = {"meeting_id": meeting_id} if meeting_id else None
    results = collection.query(query_texts=[query], n_results=n_results, where=where)
    chunks = []
    for i, doc in enumerate(results['documents'][0]):
        meta = results['metadatas'][0][i]
        chunks.append({
            "text": doc,
            "source": meta["source"],
            "meeting_id": meta["meeting_id"],
            "transcript_id": meta["transcript_id"]
        })
    return chunks