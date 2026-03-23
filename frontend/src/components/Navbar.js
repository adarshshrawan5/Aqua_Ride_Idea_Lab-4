import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-aqua-600 text-white px-6 py-3 flex justify-between items-center shadow">
      <Link to="/" className="text-xl font-bold tracking-wide">🌊 AquaRide</Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/" className="hover:underline">Bookings</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:underline">Admin</Link>
            )}
            <span className="opacity-70">({user.role})</span>
            <button onClick={handleLogout} className="bg-white text-aqua-600 px-3 py-1 rounded-lg font-semibold hover:bg-aqua-50 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
