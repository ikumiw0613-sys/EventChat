import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getEvent,
  getEventWebSocketUrl,
  getMessages,
  type EventInfo,
  type Message,
} from "../api";

function ChatPage() {
  const { eventId } = useParams();

  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const socketRef = useRef<WebSocket | null>(null);

  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLLIElement | null>(null);

  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    let isActive = true;
    Promise.all([getEvent(eventId), getMessages(eventId)])
      .then(([event, loadedMessages]) => {
        if (!isActive) return;
        setEventInfo(event);
        setMessages(loadedMessages);
        setInitialLoaded(true);
      })
      .catch(() => {
        if (isActive) setError("イベントを読み込めませんでした");
      });

    const socket = new WebSocket(getEventWebSocketUrl(eventId));

    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        if ("id" in message) setMessages((prev) => [...prev, message]);
      } catch {
        setError("メッセージを受信できませんでした");
      }
    };

    socket.onerror = () => setError("サーバーに接続できませんでした");

    return () => {
      isActive = false;
      socket.close();
      socketRef.current = null;
    };
  }, [eventId]);

  // 新着チャットで自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // 参加時に自動スクロール
  useEffect(() => {
    if (!initialLoaded || !username) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
    });
  }, [initialLoaded, username]);

  function joinChat() {
    if (!inputName.trim()) return;

    setUsername(inputName.trim());
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
        content: content.trim(),
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

        <button onClick={joinChat}>参加</button>
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
                  <span className="message-name">{message.username}</span>

                  <div>{message.content}</div>
                </div>
              </li>
            );
          })}
          <li ref={messagesEndRef} className="scroll-anchor" />
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

          <button onClick={sendMessage}>送信</button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
