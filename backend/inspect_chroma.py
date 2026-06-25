import chromadb
import os
from chromadb.utils import embedding_functions

# Use absolute path or relative to backend
CHROMA_DIR = "./chroma_db"
if not os.path.exists(CHROMA_DIR):
    print(f"Error: {CHROMA_DIR} does not exist at {os.getcwd()}")
    exit(1)

chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

try:
    collection = chroma_client.get_collection(
        name="transcripts",
        embedding_function=embedding_fn
    )
except Exception as e:
    print(f"Error getting collection: {e}")
    exit(1)

print(f"Total items in collection: {collection.count()}")

# Get all metadatas to see what's inside
results = collection.get(include=['metadatas', 'documents'])
metadatas = results['metadatas']
documents = results['documents']

meeting_ids = set()
for meta in metadatas:
    meeting_ids.add(meta.get('meeting_id'))

print(f"Meeting IDs in ChromaDB: {meeting_ids}")

# Check specifically for meeting_id 7
meeting_7_items = [m for m in metadatas if m.get('meeting_id') == 7]
print(f"Items for meeting_id 7: {len(meeting_7_items)}")

# If there are items, check their types
if metadatas:
    for i, meta in enumerate(metadatas[:10]):
        mid = meta.get('meeting_id')
        print(f"Index {i}: meeting_id={mid} type={type(mid)} doc_preview={documents[i][:50]}...")

# Specifically check if there are any string meeting_ids
string_mids = [m.get('meeting_id') for m in metadatas if isinstance(m.get('meeting_id'), str)]
if string_mids:
    print(f"Found string meeting_ids: {set(string_mids)}")
else:
    print("No string meeting_ids found.")
