from fastapi import FastAPI, HTTPException
from apps.services.orchestrator.db.meetings import create_meeting

app = FastAPI()

@app.post("/meetings")
async def create_meeting_endpoint():
    try:
        meeting_id = create_meeting()
        return {"meeting_id": meeting_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meeting: {e}")