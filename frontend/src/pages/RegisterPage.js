import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'user' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/register', form);
      const token = res.data.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      login({ id: payload.sub, role: payload.role }, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow">
      <h1 className="text-2xl font-bold text-aqua-600 mb-6">Create an account</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-400"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">Rider</option>
          <option value="driver">Driver</option>
        </select>
        <button
          type="submit"
          className="w-full bg-aqua-500 hover:bg-aqua-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-aqua-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}
