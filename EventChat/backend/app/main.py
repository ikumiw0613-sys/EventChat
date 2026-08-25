from fastapi import FastAPI,WebSocket,WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session,select


from app.database import engine
from app.models import Event
from app.models import Message
import json

app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],
   allow_credentials = True,
   allow_methods=["*"],
   allow_headers=["*"],
)

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

@app.post("/events/{event_id}/messages")
def create_message(event_id: int, message: Message):
   with Session(engine) as session:
      db_message = Message(
         event_id = event_id,
         username = message.username,
         content=message.content
      )
      session.add(db_message)
      session.commit()
      session.refresh(db_message)
      return db_message

@app.get("/events/{event_id}/messages")
def get_messages(event_id: int):
   with Session(engine) as session:
      statement = select(Message).where(Message.event_id == event_id)
      messages = session.exec(statement).all()
      return messages


class ConnectionManager:
   def __init__(self):
      self.active_connections: dict[int, list[WebSocket]] = {}

   async def connect(self,event_id: int, websocket: WebSocket):
      await websocket.accept()

      if event_id not in self.active_connections:
         self.active_connections[event_id] = []
      self.active_connections[event_id].append(websocket)


   def disconnect(self,event_id: int,websocket: WebSocket):
      self.active_connections[event_id].remove(websocket)

      if not self.active_connections[event_id]:
         del self.active_connections[event_id]

   async def broadcast(self,event_id: int,message: str):
      for connection in self.active_connections.get(event_id,[]):
         await connection.send_text(message)

manager = ConnectionManager()


@app.websocket("/ws/events/{event_id}")
async def event_websocket(websocket: WebSocket,event_id: int):
   await manager.connect(event_id,websocket)

   try:
      while True:
         data = await websocket.receive_text()

         message_data = json.loads(data)

         with Session(engine) as session:
            db_message = Message(
               event_id=event_id,
               username = message_data["username"],
               content=message_data["content"]
            )

            session.add(db_message)
            session.commit()
            session.refresh(db_message)

         await manager.broadcast(
            event_id,
            json.dumps({
               "id" : db_message.id,
               "event_id" : db_message.event_id,
               "username" : db_message.username,
               "content" : db_message.content,
               "created_at" : db_message.created_at.isoformat()
            })
         )

   except WebSocketDisconnect:
      manager.disconnect(event_id,websocket)


