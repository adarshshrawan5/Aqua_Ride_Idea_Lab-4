import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { messages, sendMessage } = useWebSocket(`/chat/${bookingId}`);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage({ sender_id: user?.id, message: text });
    setText('');
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <h1 className="text-2xl font-bold text-aqua-700 mb-4">Chat – Booking #{bookingId}</h1>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow p-4 space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">No messages yet. Say hi!</p>
        )}
        {messages.map((m, i) => {
          const isMe = String(m.sender_id) === String(user?.id);
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-aqua-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="bg-aqua-500 hover:bg-aqua-600 text-white font-semibold px-6 py-2 rounded-lg transition">
          Send
        </button>
      </form>
    </div>
  );
}
