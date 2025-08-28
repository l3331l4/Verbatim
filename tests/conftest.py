import os
import sys
from pathlib import Path

import pytest
import mongomock
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent.parent
root_str = str(ROOT)
if root_str not in sys.path:
    sys.path.insert(0, root_str)

os.environ.setdefault("ASR_SERVICE_URL", "ws://localhost:12345")
os.environ.setdefault(
    "MONGODB_URI", "mongodb://root:example@localhost:27017/?authSource=admin")
os.environ.setdefault("DB_NAME", "verbatim-db")


@pytest.fixture(scope="session")
def mongomock_client():
    return mongomock.MongoClient()


@pytest.fixture(autouse=True)
def patch_get_db(monkeypatch, mongomock_client):
    import apps.services.orchestrator.db.connection as connection
    mongocl = mongomock_client
    monkeypatch.setattr(connection, "client", mongocl, raising=False)

    def _get_db():
        return mongocl[os.getenv("DB_NAME")]
    monkeypatch.setattr(connection, "get_db", _get_db, raising=False)
    yield


@pytest.fixture
def test_client():
    from apps.services.orchestrator.main import app
    with TestClient(app) as client:
        yield client
