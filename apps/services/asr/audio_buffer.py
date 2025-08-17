import webrtcvad
from datetime import datetime, timedelta, timezone
import numpy as np
import logging

logger = logging.getLogger(__name__)

class MeetingAudioBuffer:
    """Enhanced audio buffer with better voice activity detection and overlap handling"""

    def __init__(self, meeting_id: str, phrase_timeout: float = 0.5, max_phrase_duration: float = 30.0):
        self.meeting_id = meeting_id
        self.max_phrase_duration = max_phrase_duration
        self.phrase_timeout = phrase_timeout

        self.phrase_bytes = bytes()
        self.last_audio_time = None

        self.vad = webrtcvad.Vad(3)
        self.min_audio_duration = 1.0

        self.frame_buffer = bytes()
        self.frame_size = 320 * 2  # 20ms at 16kHz, 2 bytes per sample

    def _has_speech_webrtc(self, audio_bytes: bytes) -> bool:
        self.frame_buffer += audio_bytes
        while len(self.frame_buffer) >= self.frame_size:
            frame = self.frame_buffer[:self.frame_size]
            self.frame_buffer = self.frame_buffer[self.frame_size:]

            try:
                if self.vad.is_speech(frame, 16000):
                    return True
            except Exception:
                return False
        return False

    def add_audio_chunk(self, audio_bytes: bytes) -> bool:
        now = datetime.now(timezone.utc)

        if self._has_speech_webrtc(audio_bytes):
            self.last_audio_time = now

        self.phrase_bytes += audio_bytes

        phrase_duration = len(self.phrase_bytes) / (16000 * 2)
        silence_timeout = self.last_audio_time and (
            now - self.last_audio_time > timedelta(seconds=self.phrase_timeout))
        max_duration_exceeded = phrase_duration >= self.max_phrase_duration
        phrase_complete = silence_timeout or max_duration_exceeded

        if (phrase_complete and phrase_duration >= self.min_audio_duration and self.last_audio_time):
            audio_np = np.frombuffer(
                self.phrase_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            self.reset_buffer()
            return audio_np

        return None

    def reset_buffer(self):
        self.phrase_bytes = bytes()
        self.frame_buffer = bytes()
