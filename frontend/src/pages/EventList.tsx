import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createEvent as createEventRequest,
  getEvents,
  type EventInfo,
} from "../api";

function EventList() {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [eventName, setEventName] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setError("イベント一覧を取得できませんでした"));
  }, []);

  async function createEvent() {
    if (!eventName.trim()) {
      setError("イベント名を入力してください");
      return;
    }

    setError("");

    try {
      const newEvent = await createEventRequest(eventName.trim());
      navigate(`/events/${newEvent.id}`);
    } catch {
      setError("イベントを作成できませんでした");
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>イベント一覧</h1>

        <div className="event-form">
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                createEvent();
              }
            }}
            placeholder="イベント名"
          />

          <button onClick={createEvent}>イベント作成</button>
        </div>

        {error && <p className="error">{error}</p>}

        <ul className="event-list">
          {events.map((event) => (
            <li key={event.id} className="event-card">
              <h2>{event.name}</h2>

              <Link to={`/events/${event.id}`}>チャットに参加</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EventList;
