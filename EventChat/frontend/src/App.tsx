import { useEffect ,useState} from "react";

type Event = {
  id: number;
  name: string;
};

function App() {
  const [events,setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
    .then((response)=>response.json())
    .then((data)=>setEvents(data));
  },[]);

  return (
    <div>
      <h1>イベント一覧</h1>

      <ul>
        {events.map((event)=>(
          <li key = {event.id}>
            {event.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;