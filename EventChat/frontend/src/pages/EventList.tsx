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

  function loadEvents() {
    fetch("http://127.0.0.1:8000/events")
      .then((response) => response.json())
      .then((data) => setEvents(data));
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function createEvent() {
  if (!eventName.trim()) return;

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

  if (!response.ok) return;

  const newEvent = await response.json();

  setEventName("");

  navigate(`/events/${newEvent.id}`);
}

  return (
    <div>
      <h1>イベント一覧</h1>

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
  );
}

export default EventList;