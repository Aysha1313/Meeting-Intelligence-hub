import sqlite3, chromadb
conn = sqlite3.connect('meeting_hub.db')
db_ids = set(r[0] for r in conn.execute('SELECT meeting_id FROM transcripts WHERE status="done"'))
client = chromadb.PersistentClient(path='./chroma_db')
col = client.get_collection('transcripts')
ch_ids = set(m['meeting_id'] for m in col.get()['metadatas'])
print('SQL meeting IDs with done:', db_ids)
print('Chroma meeting IDs:', ch_ids)
