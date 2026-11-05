import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv(
    "MONGO_URI",
    "mongodb://localhost:27017/"
)

db_name = os.getenv("MONGO_DB_NAME", "travel_mini")

client = MongoClient(
    mongo_uri,
    serverSelectionTimeoutMS=3000
)

db = client[db_name]