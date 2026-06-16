const BASE = 'http://127.0.0.1:5000/api';

// ── Helper ────────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  let res, data;
  try {
    res = await fetch(`${BASE}${path}`, options);
  } catch (networkErr) {
    const err = new Error('Cannot connect to server. Make sure the backend is running (python app.py).');
    err.response = { data: { message: err.message } };
    throw err;
  }

  try {
    data = await res.json();
  } catch {
    const err = new Error('Server returned an invalid response.');
    err.response = { data: { message: err.message } };
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.response = { data };
    throw err;
  }
  return { data };
}

// ── Auth ──────────────────────────────────────────────
export const register = (body)     => api('/register', 'POST', body);
export const login    = (body)     => api('/login',    'POST', body);

// ── Trains ───────────────────────────────────────────
export const getTrains   = (from, to) => api(`/trains?from_city=${from||''}&to_city=${to||''}`);
export const addTrain    = (body)     => api('/trains',       'POST',   body);
export const deleteTrain = (id)       => api(`/trains/${id}`, 'DELETE');

// ── Bookings ─────────────────────────────────────────
export const bookTicket      = (body) => api('/book',                   'POST', body);
export const getUserBookings = (uid)  => api(`/bookings/${uid}`);
export const cancelBooking   = (bid)  => api(`/bookings/${bid}/cancel`, 'PUT');

// ── Admin ─────────────────────────────────────────────
export const getAdminStats = () => api('/admin/stats');
export const getAllBookings = () => api('/admin/bookings');
export const getAllUsers    = () => api('/admin/users');
export const deleteUser    = (id) => api(`/admin/users/${id}`, 'DELETE');
