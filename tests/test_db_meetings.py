import pytest
from apps.services.orchestrator.db.meetings import create_meeting, get_meeting_by_id, delete_meeting_by_id


def test_create_get_delete_meeting():
    meeting_id = create_meeting("Test Meeting Title")
    assert isinstance(meeting_id, str) and meeting_id

    meeting = get_meeting_by_id(meeting_id)
    assert meeting is not None
    assert meeting.title == "Test Meeting Title"
    assert meeting.status == "active"

    deleted_count = delete_meeting_by_id(meeting_id)
    assert deleted_count == 1

    assert get_meeting_by_id(meeting_id) is None
