import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))
from typing import List
from uuid import UUID
from apps.services.orchestrator.db.connection import get_db
from apps.services.orchestrator.models.phrase import Phrase

def create_phrase(meeting_id: str, phrase: str):
    phrase_obj = Phrase(
        meeting_id=UUID(meeting_id),
        phrase=phrase
    )
    db = get_db()
    phrases_collection = db["phrases"]
    phrase_dict = phrase_obj.model_dump()
    phrase_dict["phrase_id"] = str(phrase_dict["phrase_id"])
    phrase_dict["meeting_id"] = str(phrase_dict["meeting_id"])
    result = phrases_collection.insert_one(phrase_dict)
    return str(phrase_dict["phrase_id"])

def get_unprocessed_phrases(meeting_id: str):
    db = get_db()
    phrases_collection = db["phrases"]
    cursor = phrases_collection.find(
        {"meeting_id": meeting_id, "processed": False}
    ).sort("created_at", 1)
    return [Phrase(**doc) for doc in cursor]

def mark_phrases_processed(phrase_ids: List[str]):
    db = get_db()
    phrases_collection = db["phrases"]
    result = phrases_collection.update_many(
        {"phrase_id": {"$in": phrase_ids}},
        {"$set": {"processed": True}}
    )
    return result.modified_count

def delete_phrases_by_meeting(meeting_id: str):
    db = get_db()
    phrases_collection = db["phrases"]
    result = phrases_collection.delete_many({"meeting_id": meeting_id})
    return result.deleted_count