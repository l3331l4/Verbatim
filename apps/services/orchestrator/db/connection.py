import os
import logging

try:
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
except Exception:
    from mongomock import MongoClient
    ServerApi = None

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

DB_NAME = os.getenv("DB_NAME")
if not DB_NAME:
    raise ValueError("DB_NAME environment variable is not set")

if ServerApi is not None:
    client = MongoClient(MONGODB_URI, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000)
else:
    client = MongoClient(MONGODB_URI)

def connect_to_mongodb():
    try:
        client.admin.command('ping')
        logger.info("Connected to MongoDB")
        return client
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        return None
    
def get_db():
    return client[DB_NAME]

if __name__ == "__main__":
    connect_to_mongodb()