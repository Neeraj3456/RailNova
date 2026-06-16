import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../api';

export default function Bookings({ user }) {
  const navigate  = useNavigate();
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
  }, []); // eslint-disable-line

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getUserBookings(user.id);
      setBookings(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings(b => b.map(bk => bk.id === id ? { ...bk, status: 'cancelled' } : bk));
    } catch { /* ignore */ }
    setCancelling(null);
  };

  const confirmed  = bookings.filter(b => b.status === 'confirmed');
  const cancelled  = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>MY BOOKINGS</h1>
        <p>Track and manage all your train tickets, {user?.name}.</p>
      </div>

      {/* ── Summary ── */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Total Trips</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: '#68d391' }}>{confirmed.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled</div>
          <div className="stat-value" style={{ color: '#fc8181' }}>{cancelled.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : bookings.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎫</div>
          <div>No bookings yet.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/trains')}>
            Search Trains
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => (
            <div key={b.id} className="ticket">
              <div className="ticket-top">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text)' }}>
                      {b.train_name}
                    </div>
                    <div style={{ color: 'var(--soft)', fontSize: 13 }}>Train #{b.train_number}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>
                      {b.status.toUpperCase()}
                    </span>
                    {b.status === 'confirmed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? '...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 32 }}>{b.from_city}</div>
                    <div style={{ color: 'var(--soft)', fontSize: 12 }}>{b.departure}</div>
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: 24, textAlign: 'center' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: 'var(--gold)' }}>{b.to_city}</div>
                    <div style={{ color: 'var(--soft)', fontSize: 12 }}>{b.arrival}</div>
                  </div>
                </div>
              </div>
              <div className="ticket-bottom">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--soft)' }}>
                    Seat: <strong style={{ color: 'var(--gold)' }}>{b.seat_number}</strong>
                  </span>
                  <span style={{ color: 'var(--soft)' }}>
                    Journey: <strong style={{ color: 'var(--text)' }}>{b.journey_date}</strong>
                  </span>
                  <span style={{ color: 'var(--soft)' }}>
                    Fare: <strong style={{ color: 'var(--gold)' }}>PKR {Number(b.price).toLocaleString()}</strong>
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                    Booked: {new Date(b.booking_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
