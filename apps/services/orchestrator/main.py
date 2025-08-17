import json
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from apps.services.orchestrator.db.meetings import create_meeting
from apps.services.orchestrator.routes import health
from pydantic import BaseModel
from typing import Optional
from .asr_client import asr_client

import logging
logger = logging.getLogger(__name__)

app = FastAPI()
connections: dict[str, list[WebSocket]] = {}

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:8001",
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

    if meeting_id not in asr_client.connections:
        success = await asr_client.connect_to_meeting(meeting_id)
        if not success:
            await websocket.close(code=1011, reason="Failed to connect to ASR service")
            return

    try:
        while True:
            message = await websocket.receive()
            if "text" in message:
                data = message["text"]
                msg = json.loads(data)
                print(f"Meeting {meeting_id} - Received: {data}")
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            elif "bytes" in message:
                await asr_client.send_audio(meeting_id, message["bytes"])

    except WebSocketDisconnect:
        print(f"Client disconnected from meeting {meeting_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if meeting_id in connections and websocket in connections[meeting_id]:
            connections[meeting_id].remove(websocket)
            if not connections[meeting_id]:
                del connections[meeting_id]
                await asr_client.disconnect_meeting(meeting_id)


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
