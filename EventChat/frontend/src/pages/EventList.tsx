import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Event = {
  id: number;
  name: string;
};

function EventList() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then((response) => response.json())
      .then((data) => setEvents(data));
  }, []);

  return (
    <div>
      <h1>イベント一覧</h1>

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