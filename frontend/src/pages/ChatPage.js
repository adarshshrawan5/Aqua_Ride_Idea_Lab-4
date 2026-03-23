import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const WS_BASE = process.env.REACT_APP_WS_URL || "ws://localhost:8000";

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  // Load persisted messages
  useEffect(() => {
    api.get(`/api/chat/${bookingId}/messages`).then(({ data }) => setMessages(data));
  }, [bookingId]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${bookingId}`);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        setMessages((prev) => [...prev, { content: e.data, sender_id: null }]);
      }
    };
    return () => ws.close();
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const { data } = await api.post(`/api/chat/${bookingId}/messages`, { content: input });
    wsRef.current?.send(JSON.stringify(data));
    setInput("");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-lg flex flex-col h-[70vh]">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-aqua-700">Chat – Booking #{bookingId}</h1>
        <span className={`text-xs font-semibold ${connected ? "text-green-500" : "text-red-400"}`}>
          {connected ? "● Live" : "○ Offline"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === user?.id
                ? "ml-auto bg-aqua-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="px-4 py-3 border-t flex gap-3">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-400"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-aqua-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-aqua-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
