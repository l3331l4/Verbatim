import json
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from apps.services.orchestrator.db.meetings import create_meeting
from apps.services.orchestrator.routes import health
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

connections: dict[str, list[WebSocket]] = {}

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


class TestMessageRequest(BaseModel):
    content: str


@app.post("/meetings")
def create_meeting_endpoint(meeting: MeetingCreateRequest):
    try:
        meeting_id = create_meeting(title=meeting.title)
        return {"meeting_id": meeting_id}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create meeting: {e}")


@app.websocket("/ws/meetings/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    print(f"Client connected to meeting {meeting_id}")

    if meeting_id not in connections:
        connections[meeting_id] = []
    connections[meeting_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            print(f"Meeting {meeting_id} - Received: {data}")
            if msg.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except:
        print(f"Client disconnected from meeting {meeting_id}")
    finally:
        connections[meeting_id].remove(websocket)
        if len(connections[meeting_id]) == 0:
            del connections[meeting_id]


@app.post("/meetings/{meeting_id}/test-message")
async def test_message(meeting_id: str, body: TestMessageRequest):
    if meeting_id not in connections or not connections[meeting_id]:
        raise HTTPException(
            status_code=404, detail="No clients connected to this meeting")

    message = {"type": "message", "content": body.content}

    for ws in connections[meeting_id]:
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending to client: {e}")

    return {"status": "ok", "sent_to": len(connections[meeting_id])}
