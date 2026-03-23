import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function BookingPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    pickup_address: '',
    pickup_lat: '',
    pickup_lon: '',
    dropoff_address: '',
    dropoff_lat: '',
    dropoff_lon: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/api/bookings/').then((res) => setBookings(res.data)).catch(() => {});
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/api/bookings/', {
        ...form,
        pickup_lat: parseFloat(form.pickup_lat),
        pickup_lon: parseFloat(form.pickup_lon),
        dropoff_lat: parseFloat(form.dropoff_lat),
        dropoff_lon: parseFloat(form.dropoff_lon),
      });
      setSuccess('Booking created successfully!');
      setForm({ pickup_address: '', pickup_lat: '', pickup_lon: '', dropoff_address: '', dropoff_lat: '', dropoff_lon: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-aqua-700 mb-6">Book a Ride</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        {error && <p className="text-red-500 mb-3">{error}</p>}
        {success && <p className="text-green-600 mb-3">{success}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded-lg px-3 py-2" placeholder="Pickup address" value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Dropoff address" value={form.dropoff_address} onChange={(e) => setForm({ ...form, dropoff_address: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Pickup lat" type="number" step="any" value={form.pickup_lat} onChange={(e) => setForm({ ...form, pickup_lat: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Dropoff lat" type="number" step="any" value={form.dropoff_lat} onChange={(e) => setForm({ ...form, dropoff_lat: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Pickup lon" type="number" step="any" value={form.pickup_lon} onChange={(e) => setForm({ ...form, pickup_lon: e.target.value })} required />
          <input className="border rounded-lg px-3 py-2" placeholder="Dropoff lon" type="number" step="any" value={form.dropoff_lon} onChange={(e) => setForm({ ...form, dropoff_lon: e.target.value })} required />
          <button type="submit" className="md:col-span-2 bg-aqua-500 hover:bg-aqua-600 text-white font-semibold py-2 rounded-lg transition">
            Request Ride
          </button>
        </form>
      </div>

      <h2 className="text-xl font-semibold text-gray-700 mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{b.pickup_address} → {b.dropoff_address}</p>
                <p className="text-sm text-gray-500">Status: <span className="capitalize font-semibold text-aqua-600">{b.status}</span></p>
                {b.fare_estimate && <p className="text-sm text-gray-500">Fare estimate: ${b.fare_estimate}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/tracking/${b.id}`)} className="text-xs bg-aqua-100 hover:bg-aqua-200 text-aqua-700 px-3 py-1 rounded-lg">Track</button>
                <button onClick={() => navigate(`/chat/${b.id}`)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg">Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
