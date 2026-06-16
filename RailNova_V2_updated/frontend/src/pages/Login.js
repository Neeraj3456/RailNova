import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function Login({ setUser }) {
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    setLoading(true);
    try {
      const res = await login(form);
      setUser(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/trains');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => { if (e.key === 'Enter') handleSubmit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, color: 'var(--gold)', letterSpacing: 4 }}>
            RAILNOVA
          </div>
          <div style={{ color: 'var(--soft)', fontSize: 15 }}>Sign in to your account</div>
        </div>

        <div className="modal" style={{ border: '1px solid var(--border)', position: 'static' }}>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <div className="form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                className="input"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft)', fontSize: 16
                  }}
                >{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : '🚂 Sign In'}
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--soft)', fontSize: 14 }}>
            Don't have an account?{' '}
            <span
              style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => navigate('/register')}
            >
              Register here
            </span>
          </div>

          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(245,197,24,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--soft)' }}>
            <strong style={{ color: 'var(--gold)' }}>Demo Admin:</strong><br />
            Email: admin@railnova.com &nbsp;|&nbsp; Password: admin123
          </div>
        </div>
      </div>
    </div>
  );
}
