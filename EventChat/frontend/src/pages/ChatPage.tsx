import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

type Message = {
  id: number;
  event_id: number;
  username: string;
  content: string;
  created_at: string;
};

type EventInfo = {
  id: number;
  name: string;
};

function ChatPage() {
  const { eventId } = useParams();

  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // イベント情報取得
    fetch(`http://127.0.0.1:8000/events/${eventId}`)
    .then((response) => response.json())
    .then((data) => setEventInfo(data));

    // 過去ログ取得
    fetch(`http://127.0.0.1:8000/events/${eventId}/messages`)
      .then((response) => response.json())
      .then((data) => setMessages(data));

    // WebSocket接続
    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/events/${eventId}`
    );

    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);

      setMessages((prev) => [...prev, message]);
    };

    return () => {
      socket.close();
    };
  }, [eventId]);

  function joinChat() {
    if (!inputName.trim()) return;

    setUsername(inputName);
  }

  function sendMessage() {
    if (!content.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.send(
      JSON.stringify({
        username: username,
        content: content,
      })
    );

    setContent("");
  }

  if (!username) {
    return (
      <div>
        <h1>イベントに参加</h1>

        <input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="名前"
        />

        <button onClick={joinChat}>
          参加
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>{eventInfo ? eventInfo.name : "読み込み中..."}</h1>

      <p>参加者名: {username}</p>

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            {message.username}: {message.content}
          </li>
        ))}
      </ul>

      <input
  value={content}
  onChange={(e) => setContent(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      sendMessage();
       }
        }}
        placeholder="メッセージ"
      /> 

      <button onClick={sendMessage}>
        送信
      </button>
    </div>
  );
}

export default ChatPage;