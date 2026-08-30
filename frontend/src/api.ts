const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const WEBSOCKET_BASE_URL =
  import.meta.env.VITE_WEBSOCKET_BASE_URL ?? "ws://127.0.0.1:8000";

export type EventInfo = {
  id: number;
  name: string;
};

export type Message = {
  id: number;
  event_id: number;
  username: string;
  content: string;
  created_at: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getEvents() {
  return request<EventInfo[]>("/events");
}

export function createEvent(name: string) {
  return request<EventInfo>("/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name.trim() }),
  });
}

export function getEvent(eventId: string) {
  return request<EventInfo>(`/events/${eventId}`);
}

export function getMessages(eventId: string) {
  return request<Message[]>(`/events/${eventId}/messages`);
}

export function getEventWebSocketUrl(eventId: string) {
  return `${WEBSOCKET_BASE_URL}/ws/events/${eventId}`;
}
