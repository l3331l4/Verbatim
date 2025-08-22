import logging
import json
import uuid
import asyncio
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Path
from fastapi.middleware.cors import CORSMiddleware
from apps.services.orchestrator.db.meetings import create_meeting
from apps.services.orchestrator.routes import health
from pydantic import BaseModel
from typing import NamedTuple, Optional, Dict
from .asr_client import asr_client
ASR_CLIENT_ID_PREFIX = "asr_service_"

logger = logging.getLogger(__name__)

app = FastAPI()


class ClientInfo(NamedTuple):
    websocket: WebSocket
    client_id: str


connections: dict[str, dict[str, ClientInfo]] = {}
recording_clients: Dict[str, str] = {}
host_clients: Dict[str, str] = {}

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
    
@app.get("/meetings/{meeting_id}")
def get_meeting(meeting_id: str = Path(...)):
    from apps.services.orchestrator.db.meetings import get_meeting_by_id
    meeting = get_meeting_by_id(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"meeting_id": meeting_id, "title": meeting.title}    


async def broadcast_client_list(meeting_id: str):
    if meeting_id not in connections:
        return
    clients = []
    recording_client_id = recording_clients.get(meeting_id)

    for client_id, client_info in connections[meeting_id].items():
        clients.append({
            "clientId": client_id,
            "isRecording": client_id == recording_client_id
        })

    message = {
        "type": "client_list",
        "clients": clients,
        "count": len(clients),
    }

    for client_info in connections[meeting_id].values():
        try:
            await broadcast_to_meeting(meeting_id, message)
        except Exception as e:
            logger.error(f"Error broadcasting client list: {e}")


async def broadcast_to_meeting(meeting_id: str, message: dict):
    if meeting_id not in connections:
        return

    for client_info in connections[meeting_id].values():
        try:
            await client_info.websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error broadcasting to client: {e}")


async def forward_asr_text(meeting_id: str, message: str):
    if meeting_id not in connections:
        return
    for client_info in list(connections[meeting_id].values()):
        try:
            await client_info.websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error forwarding ASR text: {e}")


@app.on_event("startup")
async def _init_asr_callback():
    asr_client.set_broadcast_callback(forward_asr_text)


@app.websocket("/ws/meetings/{meeting_id}")
async def websocket_meeting(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    client_id = None

    try:
        identify_msg = await asyncio.wait_for(websocket.receive_text(), timeout=2)
        msg = json.loads(identify_msg)
        if msg.get("type") == "identify" and "clientId" in msg:
            client_id = msg["clientId"]
            print(
                f"Client {client_id} reconnected to meeting {meeting_id} (identify)")
        else:
            client_id = str(uuid.uuid4())[:8]
    except Exception:
        client_id = str(uuid.uuid4())[:8]

    # Check if this is the ASR service client
    is_asr_client = client_id.startswith("asr_service_")

    print(f"Client {client_id} connected to meeting {meeting_id}")

    if is_asr_client:
        print(f"ASR service client connected for meeting {meeting_id}")
        try:
            # Just handle ASR messages separately
            while True:
                message = await websocket.receive()
                # ASR specific message handling
        except WebSocketDisconnect:
            print(f"ASR client disconnected from meeting {meeting_id}")
        except Exception as e:
            print(f"ASR WebSocket error: {e}")
        finally:
            return  # Exit early for ASR clients

    first_client = meeting_id not in connections
    if first_client:
        connections[meeting_id] = {}
        success = await asr_client.connect_to_meeting(meeting_id)
        if not success:
            await websocket.close(code=1011, reason="Failed to connect to ASR service")
            return
        recording_clients[meeting_id] = client_id
        host_clients[meeting_id] = client_id
    else:
        current_host = host_clients.get(meeting_id)
        if current_host == client_id:
            recording_clients[meeting_id] = client_id
            print(f"Host {client_id} reconnected")
        elif not current_host and len(connections[meeting_id]) == 0:
            recording_clients[meeting_id] = client_id
            host_clients[meeting_id] = client_id
            print(f"Meeting revival - setting {client_id} as new host")

    connections[meeting_id][client_id] = ClientInfo(websocket, client_id)

    print(
        f"Meeting {meeting_id} now has {len(connections[meeting_id])} clients")

    can_record = host_clients.get(meeting_id) == client_id

    try:
        await websocket.send_text(json.dumps({
            "type": "connection_status",
            "status": "connected",
            "canRecord": can_record,
            "clientId": client_id,
        }))

        await broadcast_client_list(meeting_id)

        while True:
            message = await websocket.receive()
            if "text" in message:
                data = message["text"]
                msg = json.loads(data)
                print(f"Meeting {meeting_id} - Received: {data}")
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            elif "bytes" in message:
                host_id = host_clients.get(meeting_id)
                if host_id == client_id:
                    await asr_client.send_audio(meeting_id, message["bytes"])
                else:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Only the host can record audio"
                    }))
                    print(
                        f"Client {client_id} attempted to send audio, but is not the host. {host_id}")
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected from meeting {meeting_id}")
    except Exception as e:
        print(f"WebSocket error for client {client_id}: {e}")
    finally:
        if meeting_id in connections and client_id in connections[meeting_id]:
            del connections[meeting_id][client_id]

        if meeting_id in connections and not connections[meeting_id]:
            del connections[meeting_id]
            if meeting_id in recording_clients:
                recording_clients.pop(meeting_id)
            if meeting_id in host_clients:
                host_clients.pop(meeting_id)
            await asr_client.disconnect_meeting(meeting_id)
        # elif meeting_id in connections:
        #     if host_clients.get(meeting_id) == client_id:
        #         new_host = next(iter(connections[meeting_id].keys()), None)
        #         if new_host:
        #             host_clients[meeting_id] = new_host
        #             recording_clients[meeting_id] = new_host
        #             print(f"Host disconnected, reassigning to {new_host}")
        #             try:
        #                 new_host_ws = connections[meeting_id][new_host].websocket
        #                 await new_host_ws.send_text(json.dumps({
        #                     "type": "connection_status",
        #                     "status": "connected",
        #                     "canRecord": True,
        #                     "clientId": new_host,
        #                 }))
        #             except Exception:
        #                 pass
            await broadcast_client_list(meeting_id)


@app.post("/meetings/{meeting_id}/test-message")
async def test_message(meeting_id: str, body: TestMessageRequest):
    if meeting_id not in connections or not connections[meeting_id]:
        raise HTTPException(
            status_code=404, detail="No clients connected to this meeting")

    message = {"type": "message", "content": body.content}

    await broadcast_to_meeting(meeting_id, message)
    return {"status": "ok", "sent_to": len(connections[meeting_id])}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
