from fastapi import FastAPI
from sqlmodel import SQLModel, Session,select

from app.database import engine
from app.models import Event

app = FastAPI()

@app.on_event("startup")
def on_startup():
  SQLModel.metadata.create_all(engine)

@app.get("/events")
def get_events():
  with Session(engine) as session:
    statement = select(Event)
    events = session.exec(statement).all()
    return events

@app.post("/events")
def create_event(event:Event):
  with Session(engine) as session:
    session.add(event)
    session.commit()
    session.refresh(event)

    return event

@app.get("/events/{event_id}")
def get_event(event_id: int):
    with Session(engine) as session:
        event = session.get(Event, event_id)

        if event is None:
            return {"message": "Event not found"}

        return event