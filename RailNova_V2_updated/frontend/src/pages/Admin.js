import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats, getAllBookings, getAllUsers,
  getTrains, addTrain, deleteTrain, deleteUser
} from '../api';

// ── Confirm Remove User Modal ─────────────────────────────────────────────────
function ConfirmRemoveModal({ user, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div className="modal-title" style={{ color: 'var(--red)', marginBottom: 8 }}>REMOVE USER</div>
          <p style={{ color: 'var(--soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            You are about to permanently remove <strong style={{ color: 'var(--text)' }}>{user.name}</strong>
            <br /><span style={{ color: 'var(--muted)', fontSize: 13 }}>{user.email}</span>
            <br /><br />All their bookings will be cancelled. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              style={{ flex: 1, justifyContent: 'center', background: 'rgba(229,62,62,0.15)' }}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Removing…' : '🗑 Remove User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Train Modal ───────────────────────────────────────────────────────────
function AddTrainModal({ onClose, onAdded }) {
  const empty = { name:'', number:'', from_city:'', to_city:'', departure:'', arrival:'', total_seats:'', price:'' };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cities = ['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta'];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name || !form.number || !form.from_city || !form.to_city || !form.departure || !form.arrival || !form.total_seats || !form.price) {
      setError('All fields are required.'); return;
    }
    setLoading(true);
    try {
      await addTrain({ ...form, total_seats: +form.total_seats, price: +form.price });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add train');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">ADD NEW TRAIN</div>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <div className="form">
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Train Name</label>
              <input className="input" name="name" placeholder="Green Line" value={form.name} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Train Number</label>
              <input className="input" name="number" placeholder="GL-202" value={form.number} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">From City</label>
              <select className="input" name="from_city" value={form.from_city} onChange={handleChange}>
                <option value="">Select</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">To City</label>
              <select className="input" name="to_city" value={form.to_city} onChange={handleChange}>
                <option value="">Select</option>
                {cities.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Departure Time</label>
              <input className="input" name="departure" type="time" value={form.departure} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Arrival Time</label>
              <input className="input" name="arrival" type="time" value={form.arrival} onChange={handleChange} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Total Seats</label>
              <input className="input" name="total_seats" type="number" placeholder="150" value={form.total_seats} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Ticket Price (PKR)</label>
              <input className="input" name="price" type="number" placeholder="1500" value={form.price} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Adding...' : '🚂 Add Train'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export default function Admin({ user }) {
  const navigate  = useNavigate();
  const [tab, setTab]             = useState('overview');
  const [stats, setStats]         = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [trains, setTrains]       = useState([]);
  const [showAdd, setShowAdd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);  // user object to confirm removal
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError]   = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, []); // eslint-disable-line

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, b, u, t] = await Promise.all([
        getAdminStats(), getAllBookings(), getAllUsers(), getTrains('', '')
      ]);
      setStats(s.data); setBookings(b.data); setUsers(u.data); setTrains(t.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this train?')) return;
    await deleteTrain(id);
    setTrains(t => t.filter(tr => tr.id !== id));
  };

  const handleRemoveUser = async () => {
    if (!removeTarget) return;
    setRemoveLoading(true);
    setRemoveError('');
    try {
      await deleteUser(removeTarget.id);
      setUsers(u => u.filter(usr => usr.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      setRemoveError(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>ADMIN <span style={{ color: 'var(--gold)' }}>PANEL</span></h1>
          <p>Full control over trains, bookings, and passengers.</p>
        </div>
        <button className="btn btn-outline" onClick={loadAll}>🔄 Refresh</button>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {['overview','trains','bookings','users'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'trains' ? '🚂 Trains' : t === 'bookings' ? '🎫 Bookings' : '👥 Users'}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* ── OVERVIEW ── */}
          {tab === 'overview' && stats && (
            <>
              <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.total_users}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Trains</div>
                  <div className="stat-value">{stats.total_trains}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Bookings</div>
                  <div className="stat-value">{stats.total_bookings}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Revenue (PKR)</div>
                  <div className="stat-value" style={{ fontSize: 32 }}>
                    {Number(stats.revenue).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="section-title">RECENT <span>BOOKINGS</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr>
                      <th>Passenger</th><th>Train</th><th>Route</th><th>Journey</th><th>Seat</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {bookings.slice(0, 8).map(b => (
                        <tr key={b.id}>
                          <td><div style={{ fontWeight: 600 }}>{b.user_name}</div><div style={{ color: 'var(--muted)', fontSize: 12 }}>{b.email}</div></td>
                          <td>{b.train_name}</td>
                          <td>{b.from_city} → {b.to_city}</td>
                          <td>{b.journey_date}</td>
                          <td><span className="badge badge-gold">{b.seat_number}</span></td>
                          <td><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── TRAINS ── */}
          {tab === 'trains' && (
            <div className="card">
              <div className="card-header">
                <div className="section-title" style={{ marginBottom: 0 }}>ALL TRAINS</div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Train</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>Name</th><th>Number</th><th>Route</th><th>Schedule</th><th>Seats</th><th>Price</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {trains.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                        <td><span className="badge badge-blue">{t.number}</span></td>
                        <td>{t.from_city} → {t.to_city}</td>
                        <td>{t.departure} – {t.arrival}</td>
                        <td>
                          <span className={`badge ${t.available_seats > 20 ? 'badge-green' : t.available_seats > 0 ? 'badge-gold' : 'badge-red'}`}>
                            {t.available_seats}/{t.total_seats}
                          </span>
                        </td>
                        <td style={{ color: 'var(--gold)' }}>PKR {Number(t.price).toLocaleString()}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === 'bookings' && (
            <div className="card">
              <div className="section-title">ALL BOOKINGS</div>
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>ID</th><th>Passenger</th><th>Train</th><th>Route</th><th>Date</th><th>Seat</th><th>Fare</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td style={{ color: 'var(--muted)' }}>#{b.id}</td>
                        <td><div style={{ fontWeight: 600 }}>{b.user_name}</div><div style={{ color: 'var(--muted)', fontSize: 12 }}>{b.email}</div></td>
                        <td>{b.train_name}</td>
                        <td>{b.from_city} → {b.to_city}</td>
                        <td>{b.journey_date}</td>
                        <td><span className="badge badge-gold">{b.seat_number}</span></td>
                        <td style={{ color: 'var(--gold)' }}>PKR {Number(b.price).toLocaleString()}</td>
                        <td><span className={`badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-red'}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div className="card">
              <div className="card-header">
                <div className="section-title" style={{ marginBottom: 0 }}>
                  REGISTERED <span>USERS</span>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {users.length} account{users.length !== 1 ? 's' : ''} total
                </div>
              </div>
              {removeError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠️ {removeError}</div>
              )}
              <div className="table-wrap">
                <table>
                  <thead><tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ color: 'var(--muted)' }}>#{u.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: u.role === 'admin' ? 'rgba(245,197,24,0.15)' : 'rgba(49,130,206,0.15)',
                              border: `1px solid ${u.role === 'admin' ? 'var(--gold)' : 'var(--blue)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, fontWeight: 700,
                              color: u.role === 'admin' ? 'var(--gold)' : 'var(--blue)',
                              flexShrink: 0
                            }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--soft)', fontSize: 13 }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-blue'}`}>
                            {u.role === 'admin' ? '👑 admin' : '👤 user'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                          {new Date(u.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          {u.role !== 'admin' ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => { setRemoveError(''); setRemoveTarget(u); }}
                            >
                              🗑 Remove
                            </button>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: 12, fontStyle: 'italic' }}>Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && (
        <AddTrainModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); loadAll(); }}
        />
      )}

      {removeTarget && (
        <ConfirmRemoveModal
          user={removeTarget}
          onClose={() => { setRemoveTarget(null); setRemoveError(''); }}
          onConfirm={handleRemoveUser}
          loading={removeLoading}
        />
      )}
    </div>
  );
}
