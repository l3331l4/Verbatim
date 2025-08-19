import json
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from apps.services.orchestrator.db.meetings import create_meeting
from apps.services.orchestrator.routes import health
from pydantic import BaseModel
from typing import Optional, Dict
from .asr_client import asr_client

import logging
logger = logging.getLogger(__name__)

app = FastAPI()
connections: dict[str, list[WebSocket]] = {}
recording_clients: Dict[str, WebSocket] = {}

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


async def broadcast_to_meeting(meeting_id: str, message: dict):
    if meeting_id not in connections:
        return

    for ws in connections[meeting_id]:
        try:
            await ws.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error broadcasting to client: {e}")


@app.websocket("/ws/meetings/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    print(f"Client connected to meeting {meeting_id}")
    print(f"connections: {connections}")

    first_client = meeting_id not in connections
    can_record = False
    if first_client:
        connections[meeting_id] = []
        success = await asr_client.connect_to_meeting(meeting_id)
        if not success:
            await websocket.close(code=1011, reason="Failed to connect to ASR service")
            return
        recording_clients[meeting_id] = websocket
        can_record = True
    elif meeting_id not in recording_clients or recording_clients[meeting_id] is None:
        recording_clients[meeting_id] = websocket
        can_record = True

    connections[meeting_id].append(websocket)

    print(f"connections now: {connections}")
    await websocket.send_text(json.dumps({
        "type": "connection_status",
        "status": "connected",
        "canRecord": can_record,
    }))

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
                if meeting_id in recording_clients and websocket == recording_clients[meeting_id]:
                    await asr_client.send_audio(meeting_id, message["bytes"])
                else:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Only the meeting host can record audio"
                    }))

    except WebSocketDisconnect:
        print(f"Client disconnected from meeting {meeting_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if meeting_id in connections and websocket in connections[meeting_id]:
            connections[meeting_id].remove(websocket)
            was_recording = meeting_id in recording_clients and recording_clients[meeting_id] == websocket

            if was_recording and connections[meeting_id]:
                recording_clients[meeting_id] = connections[meeting_id][0]
                try:
                    await recording_clients[meeting_id].send_text(json.dumps({
                        "type": "connection_status",
                        "status": "connected",
                        "canRecord": True
                    }))
                    await broadcast_to_meeting(meeting_id, {
                        "type": "recording_client_changed",
                        "message": "A new recording client has been assigned"
                    })
                except Exception as e:
                    logger.error(f"Error notifying new recording client: {e}")

            elif was_recording:
                recording_clients.pop(meeting_id, None)
                
            if not connections[meeting_id]:
                del connections[meeting_id]
                if meeting_id in recording_clients:
                    recording_clients.pop(meeting_id)
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
