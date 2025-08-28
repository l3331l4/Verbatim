import os
from datetime import datetime, timezone
from pathlib import Path
from apps.services.asr.whisper_processor import WhisperProcessor


def test_post_process_text(tmp_path):
    wp = WhisperProcessor(model_name="base.en", transcripts_dir=str(tmp_path))

    assert wp.post_process_text("  hello world  ") == "hello world."
    assert wp.post_process_text("") == ""


def test_save_and_load_transcript(tmp_path):
    wp = WhisperProcessor(model_name="base.en", transcripts_dir=str(tmp_path))

    meeting_id = "meeting-1"
    now = datetime.now(timezone.utc)
    wp.save_to_file(meeting_id, "Test sentence", now)

    path = Path(wp.get_transcript_path(meeting_id))
    assert path.exists()

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "Test sentence" in content
