import os
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import create_engine

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. Create backend/.env from .env.example."
    )

engine = create_engine(DATABASE_URL)
