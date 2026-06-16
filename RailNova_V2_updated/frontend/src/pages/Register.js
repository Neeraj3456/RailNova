import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';

export default function Register({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required.'); return;
    }
    if (form.name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Please enter a valid email address.'); return;
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      setSuccess('✅ Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => { if (e.key === 'Enter') handleSubmit(); };

  // Password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#e53e3e', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: '#e53e3e', width: '40%' };
    const hasUpper = /[A-Z]/.test(p);
    const hasNum   = /[0-9]/.test(p);
    const hasSpec  = /[^a-zA-Z0-9]/.test(p);
    const score = [hasUpper, hasNum, hasSpec].filter(Boolean).length;
    if (score === 3) return { label: 'Strong', color: '#38a169', width: '100%' };
    if (score === 2) return { label: 'Good',   color: '#f5c518', width: '75%' };
    return { label: 'Fair', color: '#ed8936', width: '55%' };
  })();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, color: 'var(--gold)', letterSpacing: 4 }}>
            RAILNOVA
          </div>
          <div style={{ color: 'var(--soft)', fontSize: 15 }}>Create a new passenger account</div>
        </div>

        <div className="modal" style={{ border: '1px solid var(--border)', position: 'static' }}>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form">
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" type="text" name="name" placeholder="Muhammad Asad"
                value={form.name} onChange={handleChange} onKeyDown={handleKeyDown}
                autoComplete="name" />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" name="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} onKeyDown={handleKeyDown}
                autoComplete="email" />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} name="password"
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} onKeyDown={handleKeyDown}
                  autoComplete="new-password"
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--soft)', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color,
                      borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: strength.color, marginTop: 3 }}>
                    Password strength: {strength.label}
                  </div>
                </div>
              )}
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input className="input" type="password" name="confirm" placeholder="Repeat password"
                value={form.confirm} onChange={handleChange} onKeyDown={handleKeyDown}
                autoComplete="new-password" />
              {form.confirm && form.password !== form.confirm && (
                <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 3 }}>⚠️ Passwords do not match</div>
              )}
              {form.confirm && form.password === form.confirm && form.confirm.length >= 6 && (
                <div style={{ fontSize: 11, color: '#38a169', marginTop: 3 }}>✅ Passwords match</div>
              )}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '⏳ Creating account...' : '🎫 Create Account'}
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--soft)', fontSize: 14 }}>
            Already have an account?{' '}
            <span style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => navigate('/login')}>
              Sign in
            </span>
          </div>

          <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(49,130,206,0.07)',
            borderRadius: 8, fontSize: 12, color: 'var(--soft)', borderLeft: '3px solid #3182ce' }}>
            🔒 Your password is securely hashed and never stored in plain text.
          </div>
        </div>
      </div>
    </div>
  );
}
