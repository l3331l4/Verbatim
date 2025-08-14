import os
import logging
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "your-mongodb-uri-here")
client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))

def connect_to_mongodb():
    try:
        client.admin.command('ping')
        logger.info("Connected to MongoDB")
        return client
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        return None

if __name__ == "__main__":
    connect_to_mongodb()