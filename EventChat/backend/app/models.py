from datetime import datetime

from sqlmodel import Field, SQLModel


class EventBase(SQLModel):
    name: str = Field(min_length=1, max_length=100)


class Event(EventBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class EventCreate(EventBase):
    pass


class MessageBase(SQLModel):
    username: str = Field(min_length=1, max_length=50)
    content: str = Field(min_length=1, max_length=2_000)


class Message(MessageBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="event.id")
    created_at: datetime = Field(default_factory=datetime.now)


class MessageCreate(MessageBase):
    pass
