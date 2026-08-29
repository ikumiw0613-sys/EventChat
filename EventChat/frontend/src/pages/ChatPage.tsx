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
  const [error, setError] = useState("");

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
  if (!content.trim()) {
    setError("メッセージを入力してください");
    return;
  }

  if (!username.trim()) {
    setError("名前が設定されていません");
    return;
  }

  if (
    !socketRef.current ||
    socketRef.current.readyState !== WebSocket.OPEN
  ) {
    setError("サーバーに接続できていません");
    return;
  }

  setError("");

  socketRef.current.send(
    JSON.stringify({
      username,
      content,
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
  <div className="container">
    <div className="card">
      <h1>{eventInfo?.name ?? "読み込み中..."}</h1>

      <p>参加者名: {username}</p>

      {error && <p className="error">{error}</p>}

      <ul className="message-list">
  {messages.map((message) => {
    const isMine = message.username === username;

    return (
      <li
        key={message.id}
        className={`message-row ${isMine ? "mine" : "other"}`}
      >
        <div className="message-bubble">
          <span className="message-name">
            {message.username}
          </span>

          <div>{message.content}</div>
        </div>
      </li>
    );
  })}
</ul>

      <div className="message-form">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="メッセージを入力"
        />

        <button onClick={sendMessage}>
          送信
        </button>
      </div>
    </div>
  </div>
);
}

export default ChatPage;