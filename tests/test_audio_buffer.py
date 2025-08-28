import numpy as np
from apps.services.asr.audio_buffer import MeetingAudioBuffer


def test_audio_buffer_silent():
    buf = MeetingAudioBuffer("meeting-1")

    samples = 4000
    silent = (np.zeros(samples)).astype(np.int16).tobytes()
    phrase = buf.add_audio_chunk(silent)

    assert phrase is None


def test_audio_buffer_tone():

    class FakeVad:
        def __init__(self, mode=3):
            pass

        def is_speech(self, frame, sample_rate):
            return any(b != 0 for b in frame)

    samples = 4000
    buf = MeetingAudioBuffer("meeting-1", max_phrase_duration=0.25, vad=FakeVad())
    tone = (np.ones(samples) * 1000).astype(np.int16).tobytes()
    phrase = buf.add_audio_chunk(tone)
    print(phrase)

    assert isinstance(phrase, np.ndarray)


def test_audio_buffer_reset():

    samples = 4000
    buf = MeetingAudioBuffer("meeting-1")
    buf.add_audio_chunk((np.ones(samples) * 1000).astype(np.int16).tobytes())
    buf.reset_buffer()

    assert buf.phrase_bytes == b""
