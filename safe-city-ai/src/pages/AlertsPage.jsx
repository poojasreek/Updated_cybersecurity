import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Radio, XCircle, Bell, Video, User, Phone, Navigation, CheckCircle } from 'lucide-react';
import { sosAlerts as mockAlerts } from '../data/mockData';
import { useSOS } from '../context/SOSContext';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const redIcon = new L.DivIcon({ className: '', html: '<div style="width:16px;height:16px;background:#FF4D4F;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(255,77,79,0.9)"></div>' });

const statusConfig = {
  active:     { bg: 'rgba(255,77,79,0.12)',  color: '#FF4D4F', border: 'rgba(255,77,79,0.4)',  label: 'ACTIVE' },
  responding: { bg: 'rgba(255,214,10,0.1)',  color: '#FFD60A', border: 'rgba(255,214,10,0.3)', label: 'RESPONDING' },
  resolved:   { bg: 'rgba(46,204,113,0.1)',  color: '#2ECC71', border: 'rgba(46,204,113,0.3)', label: 'RESOLVED' },
};

export default function AlertsPage() {
  // ✅ Get live alerts from global context (populated by BroadcastChannel)
  const { activeAlerts, setActiveAlerts, clearPending } = useSOS();

  // Merge mock alerts with live ones, deduplicating by id
  const [localAlerts, setLocalAlerts] = useState(mockAlerts);
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(true);

  // Clear unread badge when this page mounts
  useEffect(() => { clearPending(); }, []);

  // Merge live alerts from context into local list
  useEffect(() => {
    setLocalAlerts(prev => {
      const merged = [...prev];
      for (const a of activeAlerts) {
        const idx = merged.findIndex(e => e.id === a.id);
        if (idx >= 0) merged[idx] = { ...merged[idx], ...a };
        else merged.unshift(a);
      }
      return merged;
    });
    // Auto-select the newest active live alert
    const newest = activeAlerts.find(a => a.status === 'active');
    if (newest) setSelected(prev => prev?.id === newest.id ? { ...prev, ...newest } : newest);
  }, [activeAlerts]);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDispatch = () => {
    if (!selected) return;
    const updated = { ...selected, status: 'responding', team: 'Patrol Team Alpha', eta: '2 mins' };
    setLocalAlerts(prev => prev.map(a => a.id === selected.id ? updated : a));
    setActiveAlerts(prev => prev.map(a => a.id === selected.id ? updated : a));
    setSelected(updated);
  };

  const activeCount = localAlerts.filter(a => a.status === 'active').length;
  const liveFrame = selected?.isLive ? activeAlerts.find(a => a.id === selected.id)?.frame : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>🚨 SOS Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Real-time citizen alerts · Live video feed · GPS dispatch
          </p>
        </div>
        {activeCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.4)', borderRadius: '10px', padding: '8px 16px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF4D4F', boxShadow: pulse ? '0 0 14px #FF4D4F' : 'none', transition: 'box-shadow 0.5s' }} />
            <span style={{ color: '#FF4D4F', fontWeight: '900', fontSize: '0.88rem' }}>{activeCount} LIVE EMERGENCY</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 440px' : '1fr', gap: '22px', alignItems: 'start' }}>
        {/* Alert List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '0.92rem', fontWeight: '700' }}>All Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <AnimatePresence>
              {localAlerts.map(alert => {
                const s = statusConfig[alert.status] || statusConfig.active;
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(alert)}
                    style={{ padding: '13px 16px', borderRadius: '13px', cursor: 'pointer', background: selected?.id === alert.id ? s.bg : 'rgba(0,0,0,0.18)', border: `1px solid ${selected?.id === alert.id ? s.border : 'var(--border-color)'}`, display: 'flex', alignItems: 'center', gap: '13px', transition: 'all 0.18s' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={20} color={s.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                          {alert.isLive ? '🔴 LIVE — ' : ''}{alert.citizenName || `Alert #${alert.id}`}
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: '800', padding: '2px 7px', borderRadius: '4px', background: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {alert.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {alert.time}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
              className="glass-panel" style={{ padding: '22px', borderLeft: `4px solid ${statusConfig[selected.status]?.color || '#FF4D4F'}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>📡 Intel Feed</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <XCircle size={19} />
                </button>
              </div>

              {/* ✅ Citizen Identity Card */}
              {selected.citizenName && (
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '11px', padding: '13px 15px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '800', fontSize: '0.82rem', color: '#A78BFA' }}>👤 Citizen Profile</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><User size={12} color="#A78BFA" /> <strong>{selected.citizenName}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}><Bell size={12} /> {selected.citizenEmail}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}><Navigation size={12} /> {selected.location}</span>
                  </div>
                </div>
              )}

              {/* Live Video */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#080808', minHeight: '170px', border: '1px solid rgba(255,77,79,0.25)' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.75)', padding: '4px 10px', borderRadius: '20px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: liveFrame ? '#FF4D4F' : '#444', animation: liveFrame ? 'pulse 1s infinite' : 'none' }} />
                  <span style={{ fontSize: '0.66rem', fontWeight: '800', color: 'white' }}>
                    {liveFrame ? '🔴 LIVE STREAM' : selected.isLive ? 'CONNECTING...' : 'NO STREAM'}
                  </span>
                </div>
                {liveFrame ? (
                  <img src={liveFrame} alt="Live feed" style={{ width: '100%', display: 'block', maxHeight: '210px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '170px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Video size={28} color="#333" />
                    <p style={{ color: '#444', fontSize: '0.75rem', margin: 0 }}>
                      {selected.isLive ? 'Awaiting video signal...' : 'Archived alert — no stream'}
                    </p>
                  </div>
                )}
              </div>

              {/* Map */}
              {selected.lat && selected.lng && (
                <div style={{ borderRadius: '12px', overflow: 'hidden', height: '185px' }}>
                  <MapContainer center={[selected.lat, selected.lng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker position={[selected.lat, selected.lng]} icon={redIcon}>
                      <Popup>🆘 {selected.citizenName || 'Citizen'}</Popup>
                    </Marker>
                    <Circle center={[selected.lat, selected.lng]} radius={180} pathOptions={{ color: '#FF4D4F', fillColor: '#FF4D4F', fillOpacity: 0.15 }} />
                  </MapContainer>
                </div>
              )}

              {/* Contacts */}
              {selected.contacts?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '11px 14px' }}>
                  <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '0.8rem' }}>👥 Notified Contacts ({selected.contacts.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {selected.contacts.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>{c}</span>
                        {selected.contactPhones?.[i] && <span style={{ color: 'var(--text-secondary)' }}>{selected.contactPhones[i]}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action */}
              {selected.status === 'active' ? (
                <button onClick={handleDispatch} style={{ background: 'linear-gradient(135deg, #FF4D4F, #a00000)', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Radio size={17} /> DISPATCH PATROL TO {selected.citizenName?.split(' ')[0]?.toUpperCase() || 'CITIZEN'}
                </button>
              ) : selected.status === 'responding' ? (
                <div style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid #FFD60A', borderRadius: '12px', padding: '13px', textAlign: 'center' }}>
                  <p style={{ color: '#FFD60A', fontWeight: '900', margin: 0 }}>✅ {selected.team} Dispatched</p>
                  <p style={{ fontSize: '0.76rem', margin: '4px 0 0', opacity: 0.8 }}>ETA: {selected.eta} · Officers en route</p>
                </div>
              ) : (
                <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ECC71', borderRadius: '12px', padding: '13px', textAlign: 'center' }}>
                  <p style={{ color: '#2ECC71', fontWeight: '900', margin: 0 }}><CheckCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />INCIDENT RESOLVED</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
