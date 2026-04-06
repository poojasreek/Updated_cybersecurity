import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Shield, MapPin, Clock, CheckCircle,
  Phone, Radio, ChevronRight, Filter, Bell, Zap, XCircle
} from 'lucide-react';
import { sosAlerts } from '../data/mockData';

const allAlerts = [
  ...sosAlerts,
  { id: 5, type: 'Medical', location: 'Adyar', time: '25 min ago', status: 'resolved', lat: 13.0067, lng: 80.2573 },
  { id: 6, type: 'SOS', location: 'Tambaram', time: '32 min ago', status: 'resolved', lat: 12.9249, lng: 80.1000 },
  { id: 7, type: 'Fire', location: 'Velachery', time: '41 min ago', status: 'resolved', lat: 12.9815, lng: 80.2180 },
];

const statusColors = {
  active: { bg: 'rgba(255,77,79,0.1)', color: '#FF4D4F', border: 'rgba(255,77,79,0.3)', label: 'ACTIVE' },
  responding: { bg: 'rgba(255,214,10,0.1)', color: '#FFD60A', border: 'rgba(255,214,10,0.3)', label: 'RESPONDING' },
  resolved: { bg: 'rgba(46,204,113,0.1)', color: '#2ECC71', border: 'rgba(46,204,113,0.3)', label: 'RESOLVED' },
};

const typeIcons = {
  SOS: AlertTriangle,
  Panic: Shield,
  Medical: Phone,
  Accident: Radio,
  Fire: Zap,
};

const AlertsPage = () => {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1500);
    return () => clearInterval(t);
  }, []);

  const filters = ['All', 'active', 'responding', 'resolved'];
  const filtered = filter === 'All' ? allAlerts : allAlerts.filter(a => a.status === filter);
  const activeCount = allAlerts.filter(a => a.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header with live indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>SOS & Emergency Alerts</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time monitoring of all incoming distress signals</p>
          </div>
          {activeCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.3)',
              borderRadius: '10px', padding: '8px 16px'
            }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', background: '#FF4D4F',
                boxShadow: pulse ? '0 0 12px #FF4D4F' : 'none', transition: 'box-shadow 0.5s'
              }} />
              <span style={{ color: '#FF4D4F', fontWeight: '800', fontSize: '0.9rem' }}>
                {activeCount} ACTIVE
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '4px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600',
              textTransform: f === 'All' ? 'none' : 'capitalize',
              background: filter === f ? 'var(--primary-color)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-secondary)', transition: 'all 0.25s'
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {[
          { label: 'Active Alerts', value: activeCount, color: '#FF4D4F' },
          { label: 'Responding', value: allAlerts.filter(a => a.status === 'responding').length, color: '#FFD60A' },
          { label: 'Resolved Today', value: allAlerts.filter(a => a.status === 'resolved').length, color: '#2ECC71' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: s.color, marginBottom: '6px' }}>{s.value}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts List + Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '24px', transition: 'all 0.3s' }}>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence>
              {filtered.map((alert, idx) => {
                const s = statusColors[alert.status];
                const Icon = typeIcons[alert.type] || Bell;
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setSelected(alert)}
                    style={{
                      padding: '18px 24px', borderRadius: '16px', cursor: 'pointer',
                      background: selected?.id === alert.id ? `${s.bg}` : 'rgba(0,0,0,0.2)',
                      border: `1px solid ${selected?.id === alert.id ? s.border : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (selected?.id !== alert.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (selected?.id !== alert.id) e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                      background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${s.border}`,
                      boxShadow: alert.status === 'active' && pulse ? `0 0 15px ${s.color}55` : 'none',
                      transition: 'box-shadow 0.5s'
                    }}>
                      <Icon size={22} color={s.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '800', fontSize: '0.95rem' }}>Alert #{alert.id} — {alert.type}</p>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                          background: s.bg, color: s.color, border: `1px solid ${s.border}`
                        }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={13} /> {alert.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <Clock size={13} /> {alert.time}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--text-secondary)" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <p>No alerts in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div key={selected.id}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              className="glass-panel"
              style={{
                padding: '28px', height: 'fit-content', position: 'sticky', top: '100px',
                borderLeft: `5px solid ${statusColors[selected.status].color}`
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Alert Detail</h3>
                <button onClick={() => setSelected(null)} style={{ color: 'var(--text-secondary)' }}><XCircle size={20} /></button>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {(() => { const Icon = typeIcons[selected.type] || Bell; const s = statusColors[selected.status]; return (
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.border}`, flexShrink: 0 }}>
                    <Icon size={28} color={s.color} />
                  </div>
                ); })()}
                <div>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem' }}>{selected.type} Emergency</p>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '6px',
                    background: statusColors[selected.status].bg, color: statusColors[selected.status].color,
                    border: `1px solid ${statusColors[selected.status].border}`
                  }}>{statusColors[selected.status].label}</span>
                </div>
              </div>

              {[
                ['Alert ID', `#${selected.id}`],
                ['Location', selected.location],
                ['Time', selected.time],
                ['Coordinates', `${selected.lat?.toFixed(4)}, ${selected.lng?.toFixed(4)}`],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                  <p style={{ fontWeight: '700', fontSize: '0.95rem', fontFamily: label === 'Coordinates' ? 'monospace' : 'inherit' }}>{val}</p>
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                {selected.status === 'active' && (
                  <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                    <Radio size={18} /> Dispatch Unit
                  </button>
                )}
                <button style={{
                  width: '100%', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(46,204,113,0.1)', color: '#2ECC71', border: '1px solid rgba(46,204,113,0.3)', fontWeight: '700'
                }}>
                  <CheckCircle size={16} /> Mark Resolved
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPage;
