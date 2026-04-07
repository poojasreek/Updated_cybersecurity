import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Send, Users, Plus, Phone, Shield, X, CheckCircle, Video, Navigation } from 'lucide-react';
import { emergencyContacts as defaultContacts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const SOS_CHANNEL = 'safe_city_sos';

export default function WomenSafetyPage() {
  const { user } = useAuth();

  const [sosActive, setSosActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('Locating...');
  const [contacts, setContacts] = useState(defaultContacts);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [locError, setLocError] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const localStreamRef = useRef(null);
  const channelRef = useRef(null);
  const alertIdRef = useRef(null);

  // Open BroadcastChannel once
  useEffect(() => {
    channelRef.current = new BroadcastChannel(SOS_CHANNEL);
    return () => {
      stopSOS();
      channelRef.current?.close();
    };
  }, []);

  // Get real GPS on load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLabel(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        },
        () => {
          // fallback default to Chennai T. Nagar for demo
          setLocation({ lat: 13.0418, lng: 80.2341 });
          setLocationLabel('T. Nagar, Chennai (approx)');
          setLocError(true);
        },
        { timeout: 6000, maximumAge: 30000 }
      );
    }
  }, []);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone && contacts.length < 5) {
      setContacts(prev => [...prev, { id: Date.now(), ...newContact }]);
      setNewContact({ name: '', relation: '', phone: '' });
      setShowAddContact(false);
    }
  };

  const stopSOS = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    if (channelRef.current && alertIdRef.current) {
      channelRef.current.postMessage({ type: 'SOS_RESOLVED', alertId: alertIdRef.current });
    }
    setSosActive(false);
    setNotifSent(false);
    setFrameCount(0);
    alertIdRef.current = null;
  };

  const triggerSOS = async () => {
    if (sosActive) return;
    setSosActive(true);

    const alertId = Date.now();
    alertIdRef.current = alertId;

    const activeLoc = location || { lat: 13.0418, lng: 80.2341 };

    // ✅ Build full citizen profile from logged-in user (useAuth)
    const alertPayload = {
      type: 'SOS_ALERT',
      alertId,
      // Citizen Identity (from auth)
      citizenName: user?.name || user?.email || 'Unknown Citizen',
      citizenEmail: user?.email || 'N/A',
      citizenId: user?.id || 'guest',
      // Location (real GPS)
      lat: activeLoc.lat,
      lng: activeLoc.lng,
      locationLabel,
      // Emergency contacts from profile
      contacts: contacts.map(c => `${c.name} (${c.relation})`),
      contactPhones: contacts.map(c => c.phone),
      // Timestamp
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'active',
    };

    // ✅ Broadcast instantly to Police tab via BroadcastChannel
    channelRef.current?.postMessage(alertPayload);
    setNotifSent(true);

    // ✅ Try to open camera
    let streamReady = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamReady = true;
      }
    } catch (err) {
      console.warn('Camera denied or unavailable. Using mock feed.', err);
    }

    // ✅ Stream frames at 4 FPS via BroadcastChannel
    streamIntervalRef.current = setInterval(() => {
      if (!canvasRef.current || !channelRef.current) return;
      const ctx = canvasRef.current.getContext('2d');

      if (streamReady && videoRef.current?.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      } else {
        // Animated mock feed
        const t = Date.now() / 1000;
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = '#FF4D4F';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('🔴 SOS LIVE — ' + new Date().toLocaleTimeString(), 10, 28);
        ctx.fillStyle = '#3A86FF';
        ctx.font = '12px monospace';
        ctx.fillText(`📍 ${activeLoc.lat.toFixed(5)}, ${activeLoc.lng.toFixed(5)}`, 10, 54);
        ctx.fillStyle = '#2ECC71';
        ctx.font = '11px monospace';
        ctx.fillText(`👤 ${user?.name || user?.email || 'Citizen'}`, 10, 76);
        // Animated pulse
        ctx.beginPath();
        ctx.arc(160, 155, 22 + Math.sin(t * 5) * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 77, 79, ${0.5 + Math.sin(t * 5) * 0.3})`;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SOS', 160, 159);
        ctx.textAlign = 'left';
      }

      const frame = canvasRef.current.toDataURL('image/jpeg', 0.4);
      channelRef.current?.postMessage({ type: 'VIDEO_FRAME', alertId, frame });
      setFrameCount(c => c + 1);
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>🛡️ Women Safety & SOS</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Logged in as: <strong style={{ color: 'var(--primary-color)' }}>{user?.name || user?.email}</strong> · Your location and identity are automatically sent to Police on SOS
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* SOS Panel */}
        <div className="glass-panel" style={{ flex: '1', minWidth: '300px', padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {!sosActive ? (
            <>
              {/* Location indicator */}
              <div style={{ background: 'rgba(58,134,255,0.08)', border: '1px solid rgba(58,134,255,0.2)', borderRadius: '10px', padding: '10px 18px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'stretch' }}>
                <Navigation size={14} color={locError ? '#FFD60A' : '#3A86FF'} />
                <span style={{ color: locError ? '#FFD60A' : '#3A86FF', fontWeight: '600' }}>
                  {locError ? '⚠ Approx location: ' : '✓ GPS: '}{locationLabel}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={triggerSOS}
                style={{ width: '190px', height: '190px', borderRadius: '50%', background: 'radial-gradient(circle, #FF4D4F, #a00000)', color: 'white', border: 'none', fontSize: '1.4rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 60px rgba(255,77,79,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <AlertTriangle size={46} />
                <span>SOS</span>
              </motion.button>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '260px', lineHeight: 1.7 }}>
                Tapping SOS sends your <strong>name</strong>, <strong>real GPS location</strong>, and <strong>live video</strong> directly to the Police Command Center with your {contacts.length} emergency contacts notified.
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Pulse icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.div animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,77,79,0.15)', border: '3px solid #FF4D4F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={34} color="#FF4D4F" />
                </motion.div>
              </div>

              {/* Confirmed banner */}
              {notifSent && (
                <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid #2ECC71', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="#2ECC71" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontWeight: '800', color: '#2ECC71', margin: 0, fontSize: '0.88rem' }}>Alert Sent to Police HQ!</p>
                    <p style={{ fontSize: '0.75rem', margin: '4px 0 0', lineHeight: 1.6 }}>
                      <strong>{user?.name || user?.email}</strong> · {locationLabel}<br />
                      {contacts.length} contacts notified
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div style={{ background: 'rgba(58,134,255,0.08)', border: '1px solid rgba(58,134,255,0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ margin: 0, fontWeight: '700', color: '#3A86FF', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Live GPS Transmitting</p>
                <p style={{ margin: '4px 0 0', fontSize: '0.79rem' }}>Lat: {location?.lat?.toFixed(6)} · Lng: {location?.lng?.toFixed(6)}</p>
              </div>

              {/* Video */}
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'black', border: '1px solid rgba(255,77,79,0.3)' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.75)', borderRadius: '20px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4D4F', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: '800' }}>LIVE · {frameCount} frames</span>
                </div>
                <video ref={videoRef} muted playsInline style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
                <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
              </div>

              <button onClick={stopSOS} style={{ background: 'transparent', color: '#FF4D4F', border: '1px solid rgba(255,77,79,0.4)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                ✓ I'm Safe — Cancel SOS
              </button>
            </motion.div>
          )}
        </div>

        {/* Emergency Contacts Panel */}
        <div className="glass-panel" style={{ width: '300px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '800' }}>
              <Users size={17} color="var(--primary-color)" /> Emergency Contacts
            </h3>
            <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.07)', padding: '2px 8px', borderRadius: '8px' }}>{contacts.length}/5</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 60 + 200}, 55%, 38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.8rem', flexShrink: 0 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '0.82rem' }}>{c.name} <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>({c.relation})</span></p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={9} /> {c.phone}</p>
                </div>
                <button onClick={() => setContacts(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {contacts.length < 5 && (
            !showAddContact ? (
              <button onClick={() => setShowAddContact(true)} style={{ background: 'rgba(58,134,255,0.08)', color: '#3A86FF', border: '1px dashed rgba(58,134,255,0.3)', borderRadius: '10px', padding: '9px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}>
                <Plus size={14} /> Add Contact
              </button>
            ) : (
              <div style={{ background: 'rgba(58,134,255,0.05)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(58,134,255,0.18)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[['name', 'Full Name'], ['relation', 'Relation'], ['phone', 'Phone Number']].map(([field, label]) => (
                  <input key={field} placeholder={label} value={newContact[field]} onChange={e => setNewContact(p => ({ ...p, [field]: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '7px 10px', color: 'white', fontSize: '0.8rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                ))}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddContact} style={{ flex: 1, background: '#3A86FF', color: 'white', border: 'none', borderRadius: '7px', padding: '7px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>Save</button>
                  <button onClick={() => setShowAddContact(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '7px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                </div>
              </div>
            )
          )}

          {/* Info box */}
          <div style={{ background: 'rgba(255,214,10,0.07)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(255,214,10,0.18)' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#FFD60A', fontSize: '0.78rem' }}>📡 When SOS triggers:</p>
            <p style={{ margin: '6px 0 0', fontSize: '0.73rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              • Your name &amp; identity → Police<br />
              • Real GPS coordinates → Map<br />
              • Live video stream → Police screen<br />
              • All {contacts.length} contacts notified via alert
            </p>
          </div>

          <div style={{ background: 'rgba(255,77,79,0.08)', borderRadius: '10px', padding: '12px 14px', border: '1px solid rgba(255,77,79,0.25)' }}>
            <p style={{ margin: 0, fontWeight: '700', color: '#FF4D4F', fontSize: '0.78rem' }}>Disclaimer: This app is for emergency use only.</p>
            <p style={{ margin: '8px 0 0', fontSize: '0.73rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Misuse (false SOS alerts) may lead to legal action, including fines or imprisonment.
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '0.73rem', lineHeight: 1.5, color: 'var(--text-secondary)', fontWeight: '600' }}>
              Use responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
