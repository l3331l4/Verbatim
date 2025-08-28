import pytest
from apps.services.orchestrator.db.phrases import create_phrase, get_unprocessed_phrases, mark_phrases_processed


def test_create_get_mark_phrase():
    from apps.services.orchestrator.db.meetings import create_meeting
    meeting_id = create_meeting("Phrases meeting")

    pid1 = create_phrase(meeting_id, "Hello world")
    pid2 = create_phrase(meeting_id, "Second phrase")
    assert pid1 != pid2

    unprocessed = get_unprocessed_phrases(meeting_id)
    assert len(unprocessed) == 2
    texts = [p.phrase for p in unprocessed]
    assert "Hello world" in texts and "Second phrase" in texts

    count = mark_phrases_processed([pid1])
    assert count == 1

    remaining = get_unprocessed_phrases(meeting_id)
    remaining_ids = [str(p.phrase_id) for p in remaining]
    assert str(pid1) not in remaining_ids
