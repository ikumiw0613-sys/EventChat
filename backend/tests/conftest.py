from pathlib import Path
import sys

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlmodel import SQLModel


BASE_DIR = Path(__file__).resolve().parents[1]

sys.path.insert(0, str(BASE_DIR))

load_dotenv(BASE_DIR / ".env.test", override=True)


@pytest.fixture
def client():
    from app.database import engine
    from app.main import app

    SQLModel.metadata.drop_all(engine)
    with TestClient(app) as test_client:
        yield test_client
    SQLModel.metadata.drop_all(engine)
