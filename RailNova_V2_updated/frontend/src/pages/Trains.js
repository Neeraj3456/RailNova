import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTrains, bookTicket } from '../api';

// ── Book Modal ────────────────────────────────────────────────────────────────
function BookModal({ train, user, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [date, setDate]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!date)  { setError('Please select a journey date.'); return; }
    setLoading(true); setError('');
    try {
      const res = await bookTicket({ user_id: user.id, train_id: train.id, journey_date: date });
      onSuccess(res.data.seat, res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">BOOK TICKET</div>

        {/* Train summary */}
        <div style={{ background: 'var(--charcoal)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
            {train.name} <span style={{ color: 'var(--soft)', fontSize: 16 }}>#{train.number}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--gold)' }}>{train.from_city}</div>
              <div style={{ color: 'var(--soft)', fontSize: 12 }}>{train.departure}</div>
            </div>
            <div style={{ color: 'var(--gold)', fontSize: 20 }}>→</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--text)' }}>{train.to_city}</div>
              <div style={{ color: 'var(--soft)', fontSize: 12 }}>{train.arrival}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span className="badge badge-green">💺 {train.available_seats} seats left</span>
            <span style={{ color: 'var(--gold)', fontFamily: 'Bebas Neue', fontSize: 22 }}>
              PKR {train.price.toLocaleString()}
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">Journey Date</label>
          <input
            className="input"
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleBook} disabled={loading}>
            {loading ? 'Booking...' : user ? '✅ Confirm Booking' : '🔑 Login to Book'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trains Page ───────────────────────────────────────────────────────────────
export default function Trains({ user }) {
  const [searchParams] = useSearchParams();
  const [trains, setTrains]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [fromCity, setFromCity] = useState(searchParams.get('from') || '');
  const [toCity, setToCity]     = useState(searchParams.get('to') || '');
  const [selected, setSelected] = useState(null);
  const [bookResult, setBookResult] = useState(null);

  const cities = ['', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta'];

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await getTrains(fromCity, toCity);
      setTrains(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchTrains(); }, []); // eslint-disable-line

  const handleBookSuccess = (seat, msg) => {
    setSelected(null);
    setBookResult({ seat, msg });
    fetchTrains(); // refresh availability
    setTimeout(() => setBookResult(null), 5000);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>FIND TRAINS</h1>
        <p>Search by route to find available trains and book your seat.</p>
      </div>

      {/* ── Search bar ── */}
      <div className="search-bar">
        <div className="input-group">
          <label className="input-label">From City</label>
          <select className="input" value={fromCity} onChange={e => setFromCity(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c || 'Any City'}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">To City</label>
          <select className="input" value={toCity} onChange={e => setToCity(e.target.value)}>
            {cities.map(c => <option key={c} value={c}>{c || 'Any City'}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">&nbsp;</label>
          <button className="btn btn-outline" onClick={() => { setFromCity(''); setToCity(''); }}>
            Clear
          </button>
        </div>
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={fetchTrains}>
          🔍 Search
        </button>
      </div>

      {/* ── Booking success banner ── */}
      {bookResult && (
        <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 15 }}>
          🎉 {bookResult.msg} — Your seat: <strong>{bookResult.seat}</strong>
        </div>
      )}

      {/* ── Results ── */}
      {loading ? (
        <div className="spinner" />
      ) : trains.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🚂</div>
          No trains found for this route.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: 'var(--soft)', fontSize: 14, marginBottom: 4 }}>
            {trains.length} train{trains.length > 1 ? 's' : ''} found
          </div>
          {trains.map(t => (
            <div key={t.id} className="train-card">
              {/* Departure */}
              <div>
                <div className="train-time">{t.departure}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t.from_city}</div>
                <div className="train-city">{t.name} #{t.number}</div>
              </div>
              {/* Arrow */}
              <div style={{ textAlign: 'center' }}>
                <div className="train-arrow">⎯⎯→</div>
                <div className="train-duration" style={{ marginTop: 4 }}>
                  {t.available_seats > 0 ? (
                    <span className="badge badge-green">💺 {t.available_seats} seats</span>
                  ) : (
                    <span className="badge badge-red">FULL</span>
                  )}
                </div>
              </div>
              {/* Arrival */}
              <div style={{ textAlign: 'right' }}>
                <div className="train-time" style={{ color: 'var(--gold)' }}>{t.arrival}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t.to_city}</div>
                <div className="train-city" style={{ color: 'var(--gold)' }}>
                  PKR {t.price.toLocaleString()}
                </div>
              </div>
              {/* Book button */}
              <div>
                <button
                  className="btn btn-primary"
                  disabled={t.available_seats < 1}
                  onClick={() => setSelected(t)}
                >
                  {t.available_seats > 0 ? 'Book Now' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Book modal ── */}
      {selected && (
        <BookModal
          train={selected}
          user={user}
          onClose={() => setSelected(null)}
          onSuccess={handleBookSuccess}
        />
      )}
    </div>
  );
}
