import { Routes,Route } from "react-router-dom";
import EventList from "./pages/EventList";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path = "/" element={<EventList />} />
      <Route path = "/events/:eventId" element = {<ChatPage />}/>
    </Routes>
  );
}

export default App;