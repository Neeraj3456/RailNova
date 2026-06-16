import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated train SVG component
function TrainAnimation() {
  return (
    <div style={{ position: 'relative', width: '100%', height: 80, overflow: 'hidden', marginTop: 16 }}>
      <style>{`
        @keyframes trainRide {
          0%   { transform: translateX(-320px); }
          100% { transform: translateX(calc(100vw + 320px)); }
        }
        @keyframes steamPuff {
          0%   { opacity: 0.8; transform: translate(0, 0) scale(1); }
          100% { opacity: 0;   transform: translate(-30px, -40px) scale(2.5); }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes trainRide2 {
          0%   { transform: translateX(-420px); }
          100% { transform: translateX(calc(100vw + 420px)); }
        }
        .train-wrapper {
          position: absolute;
          bottom: 10px;
          animation: trainRide 8s linear infinite;
        }
        .train-wrapper2 {
          position: absolute;
          bottom: 10px;
          animation: trainRide2 13s linear 4s infinite;
          opacity: 0.6;
          transform: scaleX(-1);
        }
        .steam { animation: steamPuff 1.2s ease-out infinite; }
        .steam2 { animation: steamPuff 1.2s ease-out 0.4s infinite; }
        .steam3 { animation: steamPuff 1.2s ease-out 0.8s infinite; }
        .wheel { transform-origin: center; animation: wheelSpin 0.6s linear infinite; }
      `}</style>

      {/* Track line */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        height: 3, background: 'rgba(245,197,24,0.25)',
        backgroundImage: 'repeating-linear-gradient(90deg, var(--gold) 0, var(--gold) 18px, transparent 18px, transparent 30px)'
      }} />

      {/* Train 1 */}
      <div className="train-wrapper">
        <svg width="280" height="60" viewBox="0 0 280 60">
          {/* Steam */}
          <circle className="steam"  cx="18" cy="12" r="6" fill="rgba(255,255,255,0.5)" />
          <circle className="steam2" cx="26" cy="8"  r="4" fill="rgba(255,255,255,0.4)" />
          <circle className="steam3" cx="12" cy="6"  r="3" fill="rgba(255,255,255,0.3)" />

          {/* Locomotive body */}
          <rect x="10" y="20" width="80" height="28" rx="5" fill="#1e2229" stroke="#f5c518" strokeWidth="1.5"/>
          {/* Cab */}
          <rect x="70" y="14" width="22" height="34" rx="4" fill="#141414" stroke="#f5c518" strokeWidth="1.5"/>
          {/* Windows */}
          <rect x="74" y="19" width="14" height="10" rx="2" fill="#f5c518" opacity="0.7"/>
          <rect x="20" y="25" width="16" height="10" rx="2" fill="#f5c518" opacity="0.5"/>
          <rect x="42" y="25" width="16" height="10" rx="2" fill="#f5c518" opacity="0.5"/>
          {/* Chimney */}
          <rect x="14" y="10" width="8" height="12" rx="2" fill="#f5c518"/>
          {/* Wheels */}
          <circle className="wheel" cx="28" cy="52" r="8" fill="none" stroke="#f5c518" strokeWidth="2"/>
          <circle cx="28" cy="52" r="3" fill="#f5c518"/>
          <circle className="wheel" cx="52" cy="52" r="8" fill="none" stroke="#f5c518" strokeWidth="2"/>
          <circle cx="52" cy="52" r="3" fill="#f5c518"/>
          <circle className="wheel" cx="76" cy="52" r="7" fill="none" stroke="#f5c518" strokeWidth="2"/>
          <circle cx="76" cy="52" r="2.5" fill="#f5c518"/>

          {/* Carriages */}
          {[110, 180, 250].map((x, i) => (
            <g key={i}>
              <rect x={x - 10} y="22" width="62" height="26" rx="4" fill="#1e2229" stroke="#2a2f38" strokeWidth="1.5"/>
              <rect x={x - 4} y="27" width="14" height="9" rx="2" fill="#f5c518" opacity="0.3"/>
              <rect x={x + 16} y="27" width="14" height="9" rx="2" fill="#f5c518" opacity="0.3"/>
              <circle className="wheel" cx={x + 2} cy="52" r="6" fill="none" stroke="#2a2f38" strokeWidth="2"/>
              <circle className="wheel" cx={x + 42} cy="52" r="6" fill="none" stroke="#2a2f38" strokeWidth="2"/>
              {/* Connector */}
              {i < 2 && <rect x={x + 50} y="33" width="12" height="4" rx="2" fill="#4a5568"/>}
            </g>
          ))}
          {/* Connector between loco and first car */}
          <rect x="90" y="33" width="12" height="4" rx="2" fill="#4a5568"/>
        </svg>
      </div>

      {/* Train 2 (smaller, opposite) */}
      <div className="train-wrapper2">
        <svg width="200" height="50" viewBox="0 0 200 50">
          <rect x="10" y="15" width="60" height="24" rx="4" fill="#141414" stroke="#2a2f38" strokeWidth="1.5"/>
          <rect x="55" y="10" width="18" height="29" rx="3" fill="#0a0a0a" stroke="#2a2f38" strokeWidth="1.5"/>
          <rect x="58" y="14" width="12" height="8" rx="2" fill="#3182ce" opacity="0.5"/>
          <rect x="12" y="10" width="6" height="8" rx="1" fill="#2a2f38"/>
          <circle className="wheel" cx="26" cy="43" r="6" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <circle className="wheel" cx="48" cy="43" r="6" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <rect x="72" y="15" width="55" height="22" rx="3" fill="#141414" stroke="#2a2f38" strokeWidth="1.5"/>
          <circle className="wheel" cx="84" cy="43" r="5" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <circle className="wheel" cx="116" cy="43" r="5" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <rect x="68" y="25" width="6" height="3" rx="1" fill="#4a5568"/>
          <rect x="130" y="15" width="55" height="22" rx="3" fill="#141414" stroke="#2a2f38" strokeWidth="1.5"/>
          <circle className="wheel" cx="142" cy="43" r="5" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <circle className="wheel" cx="174" cy="43" r="5" fill="none" stroke="#2a2f38" strokeWidth="2"/>
          <rect x="126" y="25" width="6" height="3" rx="1" fill="#4a5568"/>
        </svg>
      </div>
    </div>
  );
}

export default function Home({ user }) {
  const navigate = useNavigate();

  const features = [
    { icon: '🎫', title: 'Instant Booking',    desc: 'Book tickets in seconds. No queues, no hassle.' },
    { icon: '💺', title: 'Seat Selection',     desc: 'Choose your preferred seat with live availability.' },
    { icon: '📋', title: 'Booking History',    desc: 'Access and manage all your bookings anytime.' },
    { icon: '🛡️', title: 'Secure & Reliable',  desc: 'Fraud-proof system with encrypted data management.' },
    { icon: '🚄', title: 'Train Schedules',    desc: 'Live train info across all major routes.' },
    { icon: '❌', title: 'Easy Cancellations', desc: 'Cancel bookings with one click, hassle-free.' },
  ];

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta'];

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Hero with animated train ── */}
      <div className="hero">
        <div className="hero-content">
          <h1>SMART<br /><span>TRAIN</span><br />TRAVEL</h1>
          <p>
            RailNova replaces slow, error-prone railway booking with a fast,
            secure, and intelligent platform — for passengers and administrators alike.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/trains')}>
              🚂 Search Trains
            </button>
            {!user && (
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>
                Create Account
              </button>
            )}
          </div>
        </div>
        {/* Animated trains in hero */}
        <TrainAnimation />
      </div>

      <div className="page-content">

        {/* ── Quick city search ── */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-title">POPULAR <span>ROUTES</span></div>
          <div className="grid-3">
            {[
              { from: 'Karachi', to: 'Lahore' },
              { from: 'Lahore', to: 'Islamabad' },
              { from: 'Islamabad', to: 'Karachi' },
            ].map((r, i) => (
              <div key={i} className="card" style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/trains?from=${r.from}&to=${r.to}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text)' }}>{r.from}</div>
                    <div style={{ color: 'var(--soft)', fontSize: 12 }}>Departure</div>
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: 24, flex: 1, textAlign: 'center' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--gold)' }}>{r.to}</div>
                    <div style={{ color: 'var(--soft)', fontSize: 12 }}>Destination</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-title">WHY <span>RAILNOVA</span></div>
          <div className="grid-3">
            {features.map((f, i) => (
              <div key={i} className="card">
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, marginBottom: 8, color: 'var(--gold)' }}>
                  {f.title}
                </div>
                <div style={{ color: 'var(--soft)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live train animation section ── */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-title">TRAINS <span>IN MOTION</span></div>
          <div className="card" style={{ padding: '24px 24px 8px', overflow: 'hidden' }}>
            <div style={{ color: 'var(--soft)', fontSize: 13, marginBottom: 8 }}>
              🚂 Pakistan Railway Network — Live Route Visualization
            </div>
            <TrainAnimation />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '4px 0 0' }}>
              {cities.map(c => (
                <div key={c} style={{ textAlign: 'center' }}>
                  <div style={{ width: 1, height: 12, background: 'var(--gold)', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: 10, color: 'var(--soft)' }}>{c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cities ── */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-title">COVERED <span>CITIES</span></div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {cities.map(c => (
              <span key={c} className="badge badge-gold" style={{ fontSize: 13, padding: '8px 18px', cursor: 'pointer' }}
                onClick={() => navigate(`/trains?from=${c}`)}>
                🏙️ {c}
              </span>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        {!user && (
          <div className="card" style={{ textAlign: 'center', padding: '48px', background: 'rgba(245,197,24,0.05)', borderColor: 'var(--gold)' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, marginBottom: 12 }}>
              START YOUR JOURNEY
            </div>
            <p style={{ color: 'var(--soft)', marginBottom: 24, fontSize: 16 }}>
              Create a free account to book tickets, track your trips, and more.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started — It's Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
