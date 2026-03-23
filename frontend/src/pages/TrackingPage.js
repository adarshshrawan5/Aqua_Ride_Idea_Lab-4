import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';

export default function TrackingPage() {
  const { bookingId } = useParams();
  const { messages } = useWebSocket(`/tracking/${bookingId}`);
  const [latestLocation, setLatestLocation] = useState(null);

  useEffect(() => {
    if (messages.length > 0) {
      setLatestLocation(messages[messages.length - 1]);
    }
  }, [messages]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-aqua-700 mb-4">Live Tracking – Booking #{bookingId}</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        {latestLocation ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700 mb-1">Driver Location</p>
            <p className="text-3xl font-bold text-aqua-600">
              {latestLocation.lat?.toFixed(5)}, {latestLocation.lon?.toFixed(5)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Updates in real-time via WebSocket</p>
          </div>
        ) : (
          <p className="text-gray-400 text-center">Waiting for driver location updates…</p>
        )}
      </div>

      {/* Mapbox map placeholder – replace YOUR_MAPBOX_TOKEN in .env */}
      <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center text-gray-500">
        <span>Mapbox map renders here — set <code className="bg-gray-100 px-1 rounded">REACT_APP_MAPBOX_TOKEN</code> in .env</span>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold text-gray-600 mb-2">Location History</h2>
        <ul className="space-y-1 text-sm text-gray-500">
          {messages.map((m, i) => (
            <li key={i}>• lat {m.lat?.toFixed(5)}, lon {m.lon?.toFixed(5)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
