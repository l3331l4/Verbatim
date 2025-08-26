from whisper_processor import whisper_processor
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import Dict
from audio_buffer import MeetingAudioBuffer
import json

app = FastAPI(title="ASR Service")

sessions = {}


@app.on_event("startup")
async def startup_event():
    if not whisper_processor.load_model():
        raise RuntimeError("Failed to load Whisper model")


@app.api_route("/healthz", methods=["GET", "HEAD"])
async def healthz():
    return JSONResponse(content={"status": "ok"}, status_code=200)


@app.websocket("/process/{meeting_id}")
async def websocket_asr_process(websocket: WebSocket, meeting_id: str):
    await websocket.accept()
    sessions[meeting_id] = {
        "ws": websocket,
        "buffer": MeetingAudioBuffer(meeting_id),
    }
    buffer = sessions[meeting_id]["buffer"]

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message:
                audio_np = buffer.add_audio_chunk(message["bytes"])
                if audio_np is not None:
                    result = whisper_processor.transcribe_audio(
                        audio_np, meeting_id)

                    if result and result.get('segments_processed', 0) > 0:
                        await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        pass
    finally:
        sessions.pop(meeting_id, None)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
