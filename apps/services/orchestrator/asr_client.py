import websockets
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class ASRClient:
    def __init__(self, asr_service_url: str = "ws://localhost:8001"):
        self.asr_service_url = asr_service_url
        self.connections: Dict[str, websockets.WebSocketClientProtocol] = {}

    async def connect_to_meeting(self, meeting_id: str) -> bool:
        if meeting_id in self.connections:
            return True
        try:
            ws_url = f"{self.asr_service_url}/process/{meeting_id}"
            connection = await websockets.connect(ws_url)
            self.connections[meeting_id] = connection

            logger.info(f"Connected to ASR service for meeting {meeting_id}")
            return True
        except Exception as e:
            logger.error(
                f"Failed to connect to ASR service for meeting {meeting_id}: {e}")
            return False

    async def send_audio(self, meeting_id: str, audio_bytes: bytes) -> bool:
        if meeting_id not in self.connections:
            if not await self.connect_to_meeting(meeting_id):
                return False
        try:
            await self.connections[meeting_id].send(audio_bytes)
            return True
        except Exception as e:
            logger.error(f"Failed to send audio to ASR service: {e}")
            if meeting_id in self.connections:
                del self.connections[meeting_id]
            return False

    async def disconnect_meeting(self, meeting_id: str):
        if meeting_id in self.connections:
            try:
                await self.connections[meeting_id].close()
            except:
                pass
            del self.connections[meeting_id]
            logger.info(
                f"Disconnected from ASR service for meeting {meeting_id}")

asr_client = ASRClient()