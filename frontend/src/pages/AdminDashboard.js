import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    api.get('/api/admin/users').then((r) => setUsers(r.data)).catch(() => {});
    api.get('/api/admin/bookings').then((r) => setBookings(r.data)).catch(() => {});
  }, []);

  const deactivate = async (id) => {
    await api.patch(`/api/admin/users/${id}/deactivate`);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_active: false } : u)));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-aqua-700 mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${tab === 'users' ? 'bg-aqua-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${tab === 'bookings' ? 'bg-aqua-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.id}</td>
                  <td className="px-4 py-3">{u.full_name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.is_active ? '✅' : '❌'}</td>
                  <td className="px-4 py-3">
                    {u.is_active && (
                      <button
                        onClick={() => deactivate(u.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Driver</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{b.id}</td>
                  <td className="px-4 py-3">{b.user_id}</td>
                  <td className="px-4 py-3">{b.driver_id ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{b.status}</td>
                  <td className="px-4 py-3">{b.fare_estimate ? `$${b.fare_estimate}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
