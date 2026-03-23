import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      const token = res.data.access_token;
      // Decode role from JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      login({ id: payload.sub, role: payload.role }, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow">
      <h1 className="text-2xl font-bold text-aqua-600 mb-6">Sign in to AquaRide</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-aqua-500 hover:bg-aqua-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-aqua-600 hover:underline">Register</Link>
      </p>
    </div>
  );
}
