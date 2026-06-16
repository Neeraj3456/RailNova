import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    setUser(null);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* ── Logo ── */}
      <span className="navbar-logo" onClick={() => navigate('/')}>
        <span className="logo-dot" />
        RAIL<span style={{ color: '#fff' }}>NOVA</span>
      </span>

      {/* ── Navigation links ── */}
      <div className="nav-links">
        <button className={`nav-link ${path === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>
          Home
        </button>
        <button className={`nav-link ${path === '/trains' ? 'active' : ''}`} onClick={() => navigate('/trains')}>
          🚆 Trains
        </button>
        <button className={`nav-link ${path === '/map' ? 'active' : ''}`} onClick={() => navigate('/map')}>
          🗺️ Map
        </button>

        {user ? (
          <>
            {user.role === 'admin' ? (
              <button className={`nav-link ${path === '/admin' ? 'active' : ''}`} onClick={() => navigate('/admin')}>
                ⚙️ Admin Panel
              </button>
            ) : (
              <button className={`nav-link ${path === '/bookings' ? 'active' : ''}`} onClick={() => navigate('/bookings')}>
                🎫 My Bookings
              </button>
            )}
            <div className="nav-user">
              <span>
                {user.role === 'admin' ? '👑' : '👤'} {user.name}
              </span>
              <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
            </div>
          </>
        ) : (
          <>
            <button className={`nav-link ${path === '/login' ? 'active' : ''}`} onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
