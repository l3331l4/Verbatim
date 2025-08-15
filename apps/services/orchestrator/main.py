import json
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from apps.services.orchestrator.db.meetings import create_meeting
from apps.services.orchestrator.routes import health
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,           
    allow_methods=["*"],                
    allow_headers=["*"],               
)

app.include_router(health.router)

class MeetingCreateRequest(BaseModel):
    title: Optional[str] = None

@app.post("/meetings")
def create_meeting_endpoint(meeting: MeetingCreateRequest):
    try:
        meeting_id = create_meeting(title=meeting.title)
        return {"meeting_id": meeting_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create meeting: {e}")
    
@app.websocket("/ws/meetings/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    print(f"Client connected to meeting {meeting_id}")

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            print(f"Meeting {meeting_id} - Received: {data}")
            if msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except:
        print(f"Client disconnected from meeting {meeting_id}")
