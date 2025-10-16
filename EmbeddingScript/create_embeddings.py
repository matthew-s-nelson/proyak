from law_specialties import specialties
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
import json
import numpy as np

###
# This file is used to create embeddings for the law specialties
# Run this to get the necessary packages:
#    pip install torch==2.0.1 transformers==4.30.0 sentence-transformers==2.2.2 supabase
###

with open("../config.json") as f:
    config = json.load(f)
url = config["SUPABASE_URL"]
key = config["SUPABASE_SERVICE_KEY"]

print("Initializing Supabase client...")
supabase: Client = create_client(url, key)

print("Creating embeddings...")
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

embeddings = model.encode(specialties, normalize_embeddings=True)
np.save("specialty_embeddings.npy", embeddings)

print("Inserting embeddings into Supabase...")
for name, vector in zip(specialties, embeddings):
    # Convert numpy array to list for JSON
    response = supabase.table("specialties").insert({
        "name": name,
        "embedding": vector.tolist()
    }).execute()


print("Done!")