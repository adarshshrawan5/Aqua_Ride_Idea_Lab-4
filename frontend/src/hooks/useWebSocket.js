import { useState, useEffect, useRef } from 'react';

const WS_BASE = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

export function useWebSocket(path) {
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${WS_BASE}${path}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => ws.close();
  }, [path]);

  const sendMessage = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { messages, sendMessage };
}
