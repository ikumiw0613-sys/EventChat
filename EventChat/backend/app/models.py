from sqlmodel import SQLModel, Field
from datetime import datetime

class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str

class Message(SQLModel,table = True):
    id : int | None = Field(default=None,primary_key =True)
    event_id: int = Field(foreign_key = "event.id")

    username:str
    content:str
    created_at:datetime = Field(default_factory=datetime.now)