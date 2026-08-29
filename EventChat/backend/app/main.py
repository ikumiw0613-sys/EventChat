import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select

from app.database import engine
from app.models import Event, EventCreate, Message, MessageCreate


@asynccontextmanager
async def lifespan(_: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
   CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_event(session: Session, event_id: int) -> Event:
    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@app.get("/events")
def get_events():
    with Session(engine) as session:
        return session.exec(select(Event)).all()


@app.post("/events")
def create_event(event: EventCreate):
    with Session(engine) as session:
        db_event = Event(name=event.name.strip())
        session.add(db_event)
        session.commit()
        session.refresh(db_event)
        return db_event


@app.get("/events/{event_id}")
def get_event(event_id: int):
    with Session(engine) as session:
        return require_event(session, event_id)


@app.post("/events/{event_id}/messages")
def create_message(event_id: int, message: MessageCreate):
    with Session(engine) as session:
        require_event(session, event_id)
        db_message = Message(event_id=event_id, **message.model_dump())
        session.add(db_message)
        session.commit()
        session.refresh(db_message)
        return db_message


@app.get("/events/{event_id}/messages")
def get_messages(event_id: int):
    with Session(engine) as session:
        require_event(session, event_id)
        statement = (
            select(Message)
            .where(Message.event_id == event_id)
            .order_by(Message.created_at, Message.id)
        )
        return session.exec(statement).all()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, event_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(event_id, []).append(websocket)

    def disconnect(self, event_id: int, websocket: WebSocket):
        connections = self.active_connections.get(event_id)
        if not connections:
            return

        if websocket in connections:
            connections.remove(websocket)

        if not connections:
            self.active_connections.pop(event_id, None)

    async def broadcast(self, event_id: int, message: str):
        for connection in self.active_connections.get(event_id, []).copy():
            try:
                await connection.send_text(message)
            except RuntimeError:
                self.disconnect(event_id, connection)

manager = ConnectionManager()


@app.websocket("/ws/events/{event_id}")
async def event_websocket(websocket: WebSocket, event_id: int):
    with Session(engine) as session:
        if session.get(Event, event_id) is None:
            await websocket.close(code=1008, reason="Event not found")
            return

    await manager.connect(event_id, websocket)
    try:
        while True:
            try:
                message = MessageCreate.model_validate_json(
                    await websocket.receive_text()
                )
            except (ValueError, json.JSONDecodeError):
                await websocket.send_json({"error": "Invalid message"})
                continue

            with Session(engine) as session:
                db_message = Message(event_id=event_id, **message.model_dump())
                session.add(db_message)
                session.commit()
                session.refresh(db_message)

            await manager.broadcast(event_id, db_message.model_dump_json())
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(event_id, websocket)


