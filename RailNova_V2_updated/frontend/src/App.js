import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar    from './components/Navbar';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Trains    from './pages/Trains';
import Bookings  from './pages/Bookings';
import Admin     from './pages/Admin';
import TrainMap  from './pages/TrainMap';

// Protected route: redirects to login if not authenticated
function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// Admin only route
function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  // Persistent login via localStorage (survives page refresh + browser close)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('railnova_user')) || null; }
    catch { return null; }
  });

  const handleSetUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem('railnova_user', JSON.stringify(u));
    else   localStorage.removeItem('railnova_user');
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar user={user} setUser={handleSetUser} />
        <Routes>
          <Route path="/"         element={<Home user={user} />} />
          <Route path="/trains"   element={<Trains user={user} />} />
          <Route path="/map"      element={<TrainMap user={user} />} />
          <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login setUser={handleSetUser} />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register setUser={handleSetUser} />} />
          <Route path="/bookings" element={
            <PrivateRoute user={user}>
              <Bookings user={user} />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute user={user}>
              <Admin user={user} />
            </AdminRoute>
          } />
          <Route path="*" element={
            <div className="page-content">
              <div className="empty">
                <div className="empty-icon">🚂</div>
                <div>Page not found.</div>
              </div>
            </div>
          } />
        </Routes>
        <footer className="footer">
          RailNova © 2025 — Built by <span>Group ZAB-FEST</span> · SZABIST
        </footer>
      </div>
    </BrowserRouter>
  );
}
