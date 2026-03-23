import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const WS_BASE = process.env.REACT_APP_WS_URL || "ws://localhost:8000";

export default function TrackingPage() {
  const { bookingId } = useParams();
  const [location, setLocation] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/tracking/${bookingId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        setLocation(JSON.parse(event.data));
      } catch {
        // ignore malformed messages
      }
    };

    return () => ws.close();
  }, [bookingId]);

  return (
    <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-aqua-700 mb-4">
        Live Tracking – Booking #{bookingId}
      </h1>
      <div className={`mb-4 text-sm font-semibold ${connected ? "text-green-500" : "text-red-500"}`}>
        {connected ? "● Connected" : "○ Disconnected"}
      </div>
      {location ? (
        <div className="bg-aqua-50 rounded-xl p-4 text-sm space-y-1">
          <p><span className="font-semibold">Latitude:</span> {location.latitude}</p>
          <p><span className="font-semibold">Longitude:</span> {location.longitude}</p>
          <p className="text-xs text-gray-400 mt-2">
            (Integrate a Mapbox map here to visualise the driver's position in real time)
          </p>
        </div>
      ) : (
        <p className="text-gray-400">Waiting for driver location…</p>
      )}
    </div>
  );
}
