import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..')))

from apps.services.orchestrator.db.connection import get_db
from apps.services.orchestrator.models.meeting import Meeting

def create_meeting(title):
    meeting = Meeting(
        title=title,
        status="active"
    )
    db = get_db()
    meetings_collection = db["meetings"]
    meeting_dict = meeting.model_dump()
    meeting_dict["meeting_id"] = str(meeting_dict["meeting_id"])
    result = meetings_collection.insert_one(meeting_dict)
    return meeting_dict["meeting_id"]

def get_meeting_by_id(meeting_id: str):
    db = get_db()
    meetings_collection = db["meetings"]
    doc = meetings_collection.find_one({"meeting_id": meeting_id})
    if not doc:
        return None
    return Meeting(**doc)

def delete_meeting_by_id(meeting_id: str):
    db = get_db()
    meetings_collection = db["meetings"]
    result = meetings_collection.delete_one({"meeting_id": meeting_id})
    return result.deleted_count

if __name__ == "__main__":
    meeting_id = create_meeting(title="Test Meeting")
    print(f"Created meeting with ID: {meeting_id}")