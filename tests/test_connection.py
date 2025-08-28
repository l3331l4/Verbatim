import pytest
import apps.services.orchestrator.db.connection as connection


def test_connect_to_mongodb_success():
    client = connection.connect_to_mongodb()
    assert client is not None


def test_connect_to_mongodb_failure(monkeypatch):
    
    class FakeClient:
        @property
        def admin(self):
            raise Exception("Simulated connection failure")

    monkeypatch.setattr(connection, "client", FakeClient(), raising=False)

    result = connection.connect_to_mongodb()
    assert result is None
