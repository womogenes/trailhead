# Dump into the supabase table

import json

from dotenv import load_dotenv
load_dotenv("../.env")

from supabase import create_client, Client

with open("./data.json") as fin:
    data = json.load(fin)

import os
supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

supabase.table("resources").upsert(data["nodes"]).execute()
supabase.table("trails").insert({
    "resources": [node["id"] for node in data["nodes"]],
    "edges": data["edges"],
    "trailhead_id": data["nodes"][0]["id"]
}).execute()
