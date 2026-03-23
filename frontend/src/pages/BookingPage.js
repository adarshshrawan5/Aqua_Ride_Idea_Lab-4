import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function BookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup_lat: "",
    pickup_lng: "",
    dropoff_lat: "",
    dropoff_lng: "",
  });
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/api/bookings/", {
        pickup_lat: parseFloat(form.pickup_lat),
        pickup_lng: parseFloat(form.pickup_lng),
        dropoff_lat: parseFloat(form.dropoff_lat),
        dropoff_lng: parseFloat(form.dropoff_lng),
      });
      setBooking(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed.");
    }
  };

  if (booking) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-aqua-700 mb-4">Booking Confirmed! 🎉</h2>
        <p className="text-gray-600 mb-2">Booking ID: <strong>{booking.id}</strong></p>
        <p className="text-gray-600 mb-6">Estimated Fare: <strong>₹{booking.fare}</strong></p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(`/tracking/${booking.id}`)}
            className="bg-aqua-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-aqua-700 transition"
          >
            Track Ride
          </button>
          <button
            onClick={() => navigate(`/chat/${booking.id}`)}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-aqua-700 mb-6">Book a Ride</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="any"
            placeholder="Pickup Latitude"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
            value={form.pickup_lat}
            onChange={(e) => setForm({ ...form, pickup_lat: e.target.value })}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Pickup Longitude"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
            value={form.pickup_lng}
            onChange={(e) => setForm({ ...form, pickup_lng: e.target.value })}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Drop-off Latitude"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
            value={form.dropoff_lat}
            onChange={(e) => setForm({ ...form, dropoff_lat: e.target.value })}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Drop-off Longitude"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
            value={form.dropoff_lng}
            onChange={(e) => setForm({ ...form, dropoff_lng: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-aqua-600 text-white py-2 rounded-lg font-semibold hover:bg-aqua-700 transition"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}
