import os
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import create_engine
from sqlalchemy.pool import StaticPool

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. Create backend/.env from .env.example."
    )

engine_options = {}
if DATABASE_URL in {"sqlite://", "sqlite:///:memory:"}:
    engine_options = {
        "connect_args": {"check_same_thread": False},
        "poolclass": StaticPool,
    }

engine = create_engine(DATABASE_URL, **engine_options)
