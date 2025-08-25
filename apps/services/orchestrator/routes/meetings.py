from fastapi import APIRouter, HTTPException
from db.meetings import get_meeting_by_id

router = APIRouter()

@router.get("/meetings/{meeting_id}/status")
async def meeting_status(meeting_id: str):
    meeting = get_meeting_by_id(meeting_id)
    if not meeting or getattr(meeting, "status", None) != "active":
        raise HTTPException(status_code=404, detail="Meeting not found or inactive")
    return {"status": "active"}