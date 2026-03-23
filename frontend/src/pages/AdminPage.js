import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    api.get("/api/bookings/").then(({ data }) => setBookings(data));
    api.get("/api/drivers/available").then(({ data }) => setDrivers(data));
  }, []);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-aqua-700 mb-4">Admin Dashboard</h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-aqua-50 rounded-xl p-6 text-center shadow">
            <p className="text-4xl font-bold text-aqua-700">{bookings.length}</p>
            <p className="text-gray-500 text-sm mt-1">Total Bookings</p>
          </div>
          <div className="bg-aqua-50 rounded-xl p-6 text-center shadow">
            <p className="text-4xl font-bold text-aqua-700">{drivers.length}</p>
            <p className="text-gray-500 text-sm mt-1">Available Drivers</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">All Bookings</h2>
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-aqua-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Fare</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{b.id}</td>
                  <td className="px-4 py-2">{b.user_id}</td>
                  <td className="px-4 py-2">
                    <span className="capitalize bg-aqua-100 text-aqua-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">₹{b.fare}</td>
                  <td className="px-4 py-2">{new Date(b.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Available Drivers</h2>
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-aqua-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Driver ID</th>
                <th className="px-4 py-2 text-left">Vehicle</th>
                <th className="px-4 py-2 text-left">Lat</th>
                <th className="px-4 py-2 text-left">Lng</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{d.id}</td>
                  <td className="px-4 py-2">{d.vehicle_type}</td>
                  <td className="px-4 py-2">{d.latitude ?? "—"}</td>
                  <td className="px-4 py-2">{d.longitude ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
