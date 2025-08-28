import websockets
import asyncio
import logging
from typing import Dict, Optional, Callable, Awaitable
import os
import json

logger = logging.getLogger(__name__)

BroadcastCallback = Callable[[str, str], Awaitable[None]]


class ASRClient:
    def __init__(self, asr_service_url: str = None):
        if asr_service_url is None:
            asr_service_url = os.environ.get("ASR_SERVICE_URL")
        if not asr_service_url:
            raise ValueError("ASR_SERVICE_URL environment variable is not set")
        self.asr_service_url = asr_service_url
        self.connections: Dict[str, websockets.WebSocketClientProtocol] = {}
        self._broadcast_callback: Optional[BroadcastCallback] = None

    def set_broadcast_callback(self, cb: BroadcastCallback):
        self._broadcast_callback = cb

    async def connect_to_meeting(self, meeting_id: str) -> bool:
        if meeting_id in self.connections and not self.connections[meeting_id].closed:
            return True
        try:
            logger.info(f"Connecting to ASR service at {self.asr_service_url}/process/{meeting_id}")
            ws_url = f"{self.asr_service_url}/process/{meeting_id}"
            self.connections[meeting_id] = await websockets.connect(ws_url)

            await self.connections[meeting_id].send(json.dumps({
                "type": "identify",
                "clientId": f"asr_service_{meeting_id}"
            }))

            asyncio.create_task(self.listen_for_messages(meeting_id))
            logger.info(f"Connected to ASR service for meeting {meeting_id}")
            return True
        except Exception as e:
            logger.error(
                f"Failed to connect to ASR service for meeting {meeting_id}: {e}")
            return False

    async def send_audio(self, meeting_id: str, audio_bytes: bytes) -> bool:
        if meeting_id not in self.connections and not await self.connect_to_meeting(meeting_id):
            return False
        try:
            await self.connections[meeting_id].send(audio_bytes)
            return True
        except Exception as e:
            await self.disconnect_meeting(meeting_id)
            return False

    async def listen_for_messages(self, meeting_id: str):
        ws = self.connections.get(meeting_id)
        if not ws:
            return
        try:
            async for message in ws:
                if self._broadcast_callback:
                    await self._broadcast_callback(meeting_id, message)
        except Exception as e:
            logger.error(f"Error in ASR message listener: {e}")
        finally:
            await self.disconnect_meeting(meeting_id)

    async def disconnect_meeting(self, meeting_id: str):
        ws = self.connections.pop(meeting_id, None)
        if ws:
            try:
                await ws.close()
            except:
                pass


asr_client = ASRClient()
