import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";



type Event = {
  id: number;
  name: string;
};

function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventName, setEventName] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  function loadEvents() {
    fetch("http://127.0.0.1:8000/events")
      .then((response) => response.json())
      .then((data) => setEvents(data));
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function createEvent() {
  if (!eventName.trim()) {
    setError("イベント名を入力してください");
    return;
  }

  setError("");

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("イベント作成に失敗しました");
    }

    const newEvent = await response.json();
    navigate(`/events/${newEvent.id}`);

  } catch (error) {
    setError("イベントを作成できませんでした");
  }
}

  return (
  <div className="container">
    <div className="card">
      <h1>イベント一覧</h1>

      <div style={{ display: "flex", gap: "8px" }}>
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

        <button onClick={createEvent}>
          イベント作成
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/events/${event.id}`}>
              {event.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
}

export default EventList;