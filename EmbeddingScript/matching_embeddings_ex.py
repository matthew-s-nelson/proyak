from supabase import create_client, Client
import numpy as np
import json

# The example specialty to find matches for
specialty_example: str = "International Law"

print("Initializing Supabase client...")
with open("../config.json") as f:
    config = json.load(f)
url = config["SUPABASE_URL"]
key = config["SUPABASE_SERVICE_KEY"]

supabase: Client = create_client(url, key)

print(f"Finding matches for: {specialty_example}")

response = supabase.table("specialties").select("name, embedding").eq("name", specialty_example).execute()

if not response.data:
    raise ValueError(f"No embedding found for specialty: {specialty_example}")

# Convert embedding to numpy array
example_embedding_data = response.data[0]['embedding']
if isinstance(example_embedding_data, str):
    example_embedding = np.array(json.loads(example_embedding_data))
else:
    example_embedding = np.array(example_embedding_data)

all_rows = supabase.table("specialties").select("name, embedding").execute().data


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

similarities = []
for row in all_rows:
    emb_data = row['embedding']
    # Convert embedding to numpy array
    if isinstance(emb_data, str):
        emb = np.array(json.loads(emb_data))
    else:
        emb = np.array(emb_data)
    
    sim = cosine_similarity(example_embedding, emb)
    similarities.append((row['name'], sim))

# Sort by similarity and get top 5 (excluding the example itself)
top_matches = sorted(similarities, key=lambda x: x[1], reverse=True)
top_matches = [match for match in top_matches if match[0] != specialty_example][:5]

print("Top 5 most similar specialties:")
for name, score in top_matches:
    print(f"{name}: {score:.4f}")