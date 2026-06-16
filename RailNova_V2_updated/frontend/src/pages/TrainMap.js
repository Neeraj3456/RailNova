import React, { useState, useEffect } from 'react';
import { getTrains } from '../api';

// ── Pakistan city coordinates (for SVG map) ───────────────────────────────────
const CITIES = {
  'Karachi':     { x: 120, y: 370, label: 'Karachi'     },
  'Hyderabad':   { x: 160, y: 330, label: 'Hyderabad'   },
  'Sukkur':      { x: 200, y: 270, label: 'Sukkur'      },
  'Multan':      { x: 240, y: 210, label: 'Multan'      },
  'Lahore':      { x: 310, y: 160, label: 'Lahore'      },
  'Rawalpindi':  { x: 290, y: 110, label: 'Rawalpindi'  },
  'Islamabad':   { x: 305, y: 95,  label: 'Islamabad'   },
  'Peshawar':    { x: 250, y: 80,  label: 'Peshawar'    },
  'Quetta':      { x: 130, y: 220, label: 'Quetta'      },
};

// Random color per train route
const ROUTE_COLORS = [
  '#f5c518', '#e53e3e', '#38a169', '#3182ce',
  '#805ad5', '#ed8936', '#00b5d8', '#f687b3',
];

export default function TrainMap() {
  const [trains, setTrains]     = useState([]);
  const [selected, setSelected] = useState(null);
  const [hoveredCity, setHoveredCity] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getTrains('', '').then(r => {
      setTrains(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Which trains pass through a city
  const cityTrains = (city) =>
    trains.filter(t => t.from_city === city || t.to_city === city);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>TRAIN <span style={{ color: 'var(--gold)' }}>ROUTE MAP</span></h1>
        <p>All active train routes across Pakistan — click a train to highlight its route.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* ── SVG Map ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, color: 'var(--text)' }}>PAKISTAN RAILWAY NETWORK</div>
            {selected && (
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Clear</button>
            )}
          </div>

          <div style={{ background: '#0d1117', position: 'relative' }}>
            <svg viewBox="0 0 460 460" style={{ width: '100%', height: 'auto' }}>
              {/* ── Background grid ── */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="460" height="460" fill="url(#grid)" />

              {/* ── Pakistan outline (simplified) ── */}
              <path
                d="M 200,40 L 260,35 L 310,55 L 340,70 L 360,90 L 340,120 L 360,140 L 350,170 L 320,190 L 300,220 L 310,260 L 280,290 L 260,330 L 230,370 L 200,400 L 160,420 L 110,400 L 80,370 L 60,330 L 70,280 L 90,240 L 100,190 L 80,150 L 90,110 L 130,80 L 160,55 Z"
                fill="rgba(245,197,24,0.04)"
                stroke="rgba(245,197,24,0.15)"
                strokeWidth="1.5"
              />

              {/* ── Train routes ── */}
              {trains.map((train, i) => {
                const from = CITIES[train.from_city];
                const to   = CITIES[train.to_city];
                if (!from || !to) return null;
                const color     = ROUTE_COLORS[i % ROUTE_COLORS.length];
                const isSelected = selected?.id === train.id;
                const isOther    = selected && !isSelected;
                return (
                  <g key={train.id}>
                    {/* Route line */}
                    <line
                      x1={from.x} y1={from.y}
                      x2={to.x}   y2={to.y}
                      stroke={color}
                      strokeWidth={isSelected ? 3.5 : isOther ? 0.5 : 1.5}
                      strokeDasharray={isSelected ? 'none' : '6,3'}
                      opacity={isOther ? 0.2 : isSelected ? 1 : 0.7}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setSelected(selected?.id === train.id ? null : train)}
                    />
                    {/* Midpoint train icon */}
                    {(isSelected || !selected) && (
                      <text
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 - 6}
                        textAnchor="middle"
                        fontSize="12"
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => setSelected(selected?.id === train.id ? null : train)}
                      >
                        🚂
                      </text>
                    )}
                  </g>
                );
              })}

              {/* ── City nodes ── */}
              {Object.entries(CITIES).map(([name, pos]) => {
                const active  = cityTrains(name).length > 0;
                const hovered = hoveredCity === name;
                const trainCount = cityTrains(name).length;
                return (
                  <g key={name}
                    style={{ cursor: active ? 'pointer' : 'default' }}
                    onMouseEnter={() => setHoveredCity(name)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Glow ring */}
                    {active && (
                      <circle cx={pos.x} cy={pos.y} r={hovered ? 14 : 10}
                        fill="rgba(245,197,24,0.1)"
                        stroke="rgba(245,197,24,0.3)"
                        strokeWidth="1"
                        style={{ transition: 'all 0.2s' }}
                      />
                    )}
                    {/* City dot */}
                    <circle
                      cx={pos.x} cy={pos.y} r={hovered ? 7 : 5}
                      fill={active ? '#f5c518' : '#4a5568'}
                      stroke={active ? '#fff' : '#2a2f38'}
                      strokeWidth="1.5"
                      style={{ transition: 'all 0.2s' }}
                    />
                    {/* City name */}
                    <text
                      x={pos.x + 10} y={pos.y + 4}
                      fill={active ? (hovered ? '#f5c518' : '#e8edf5') : '#4a5568'}
                      fontSize="11" fontWeight={hovered ? '700' : '500'}
                      fontFamily="DM Sans, sans-serif"
                      style={{ transition: 'all 0.2s' }}
                    >
                      {name}
                    </text>
                    {/* Train count badge */}
                    {active && hovered && (
                      <text
                        x={pos.x + 10} y={pos.y + 16}
                        fill="#f5c518" fontSize="10"
                        fontFamily="DM Sans, sans-serif"
                      >
                        {trainCount} train{trainCount > 1 ? 's' : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {trains.map((t, i) => (
              <div key={t.id}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: selected && selected.id !== t.id ? 0.3 : 1 }}
                onClick={() => setSelected(selected?.id === t.id ? null : t)}
              >
                <div style={{ width: 24, height: 3, background: ROUTE_COLORS[i % ROUTE_COLORS.length], borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: 'var(--soft)' }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Train List Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Selected train detail */}
          {selected && (
            <div className="card" style={{ borderColor: 'var(--gold)', background: 'rgba(245,197,24,0.05)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 26, color: 'var(--gold)', marginBottom: 12 }}>
                {selected.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div style={{ color: 'var(--soft)' }}>Train #</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selected.number}</div>
                <div style={{ color: 'var(--soft)' }}>From</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selected.from_city}</div>
                <div style={{ color: 'var(--soft)' }}>To</div>
                <div style={{ color: 'var(--gold)', fontWeight: 600 }}>{selected.to_city}</div>
                <div style={{ color: 'var(--soft)' }}>Departure</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selected.departure}</div>
                <div style={{ color: 'var(--soft)' }}>Arrival</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{selected.arrival}</div>
                <div style={{ color: 'var(--soft)' }}>Available Seats</div>
                <div style={{ fontWeight: 600 }}>
                  <span className={`badge ${selected.available_seats > 20 ? 'badge-green' : selected.available_seats > 0 ? 'badge-gold' : 'badge-red'}`}>
                    {selected.available_seats}/{selected.total_seats}
                  </span>
                </div>
                <div style={{ color: 'var(--soft)' }}>Fare</div>
                <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 16 }}>
                  PKR {Number(selected.price).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* All trains schedule */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, color: 'var(--text)' }}>
                ALL TRAINS SCHEDULE
              </div>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : (
              <div>
                {trains.map((t, i) => (
                  <div key={t.id}
                    onClick={() => setSelected(selected?.id === t.id ? null : t)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selected?.id === t.id ? 'rgba(245,197,24,0.07)' : 'transparent',
                      transition: 'background 0.2s',
                      borderLeft: selected?.id === t.id ? `3px solid ${ROUTE_COLORS[i % ROUTE_COLORS.length]}` : '3px solid transparent',
                    }}
                  >
                    {/* Train name row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROUTE_COLORS[i % ROUTE_COLORS.length] }} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{t.name}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>#{t.number}</span>
                    </div>

                    {/* Route + times */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>{t.departure}</div>
                        <div style={{ fontSize: 11, color: 'var(--soft)' }}>{t.from_city}</div>
                      </div>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${ROUTE_COLORS[i % ROUTE_COLORS.length]}, transparent)`, margin: '0 4px' }} />
                      <span style={{ fontSize: 14 }}>🚂</span>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${ROUTE_COLORS[i % ROUTE_COLORS.length]})`, margin: '0 4px' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, color: ROUTE_COLORS[i % ROUTE_COLORS.length], lineHeight: 1 }}>{t.arrival}</div>
                        <div style={{ fontSize: 11, color: 'var(--soft)' }}>{t.to_city}</div>
                      </div>
                    </div>

                    {/* Seats + price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span className={`badge ${t.available_seats > 20 ? 'badge-green' : t.available_seats > 0 ? 'badge-gold' : 'badge-red'}`} style={{ fontSize: 10 }}>
                        💺 {t.available_seats} seats
                      </span>
                      <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 700 }}>
                        PKR {Number(t.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="stat-card" style={{ padding: 16 }}>
              <div className="stat-label">Active Trains</div>
              <div className="stat-value" style={{ fontSize: 32 }}>{trains.length}</div>
            </div>
            <div className="stat-card" style={{ padding: 16 }}>
              <div className="stat-label">Total Seats</div>
              <div className="stat-value" style={{ fontSize: 32 }}>
                {trains.reduce((s, t) => s + t.available_seats, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
