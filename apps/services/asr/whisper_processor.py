import os
import torch
import numpy as np
from datetime import datetime, timezone
from typing import Optional, Dict
from faster_whisper import WhisperModel


class WhisperProcessor:

    def __init__(self, model_name: str = "base.en", transcripts_dir: str = "transcripts"):
        self.model_name = model_name
        self.model = None
        self.transcripts_dir = transcripts_dir
        self.compute_type = "float32"

        os.makedirs(self.transcripts_dir, exist_ok=True)

    def load_model(self):
        try:

            device = "cuda" if torch.cuda.is_available() else "cpu"
            if device == "cuda":
                self.compute_type = "float16"

            self.model = WhisperModel(
                self.model_name,
                device=device,
                compute_type=self.compute_type,
                num_workers=1
            )
            return True
        except Exception:
            return False

    def is_ready(self) -> bool:
        return self.model is not None

    def get_transcript_path(self, meeting_id: str) -> str:
        return os.path.join(self.transcripts_dir, f"{meeting_id}.txt")

    def post_process_text(self, text: str) -> str:
        if not text:
            return ""
        text = " ".join(text.split()).strip()
        if len(text) < 3:
            return ""
        if text and not text[-1] in '.!?':
            text += "."
        return text

    def save_to_file(self, meeting_id: str, text: str, timestamp: datetime) -> None:
        file_path = self.get_transcript_path(meeting_id)
        line = f"[{timestamp.strftime('%H:%M:%S')}] {text}\n"
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(line)

    def transcribe_audio(self, audio_np: np.ndarray, meeting_id: str) -> Optional[Dict]:
        if not self.is_ready() or len(audio_np) == 0:
            return None

        try:
            audio_data = audio_np.astype(np.float32)
            max_val = np.abs(audio_data).max()
            if max_val > 1.0:
                audio_data = audio_data / max_val

            segments, info = self.model.transcribe(
                audio_data,
                language="en",
                task="transcribe",
                # VAD
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=500,  # Minimum silence before split
                    threshold=0.5,                # Voice activity threshold
                ),
                # Quality
                beam_size=3,                    # Balance between speed and accuracy
                temperature=0.0,                # More focused transcription
                compression_ratio_threshold=2.4,  # Filter out repetitive segments
                log_prob_threshold=-1.0,        # Filter low-confidence segments
                no_speech_threshold=0.6,        # Filter silence
                # Context
                condition_on_previous_text=True,
                # Segment length
                word_timestamps=True,           # Get word-level timestamps
            )

            segment_texts = []
            now = datetime.now(timezone.utc)

            for segment in segments:
                text = self.post_process_text(segment.text)
                if not text:
                    continue
                self.save_to_file(meeting_id, text, now)
                print(f"Transcript [{now.strftime('%H:%M:%S')}]: {text}")
                segment_texts.append(text)

            combined_text = " ".join(segment_texts)
            return {
                'type': 'transcript',
                'segments_processed': len(segment_texts),
                'audio_duration': len(audio_data) / 16000,
                'language_confidence': info.language_probability,
                'text': combined_text,
            }

        except Exception:
            return None

whisper_processor = WhisperProcessor()