import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Map as MapIcon, Navigation, Clock, Shield, CheckCircle, 
  Activity, Cpu, User, Locate, Layers, Edit3, Save, 
  Trash2, RefreshCw, Loader2, ChevronRight, Zap
} from 'lucide-react';

// --- CUSTOM MARKER FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- MOCK OFFICERS FOR GPS TRACKING ---
const INITIAL_OFFICERS = [
  { id: 101, name: 'Officer Rajesh', status: 'Patrolling', lat: 13.0418, lng: 80.2341, speed: '24 km/h', battery: '88%' },
  { id: 102, name: 'Officer Priya', status: 'Responding', lat: 13.0850, lng: 80.2101, speed: '42 km/h', battery: '45%' },
  { id: 103, name: 'Officer Arjun', status: 'Idle', lat: 13.0067, lng: 80.2206, speed: '0 km/h', battery: '92%' },
];

const MapClickHandler = ({ onMapClick, enabled }) => {
  useMapEvents({
    click: (e) => {
      if (enabled) onMapClick(e.latlng);
    },
  });
  return null;
};

const PatrolRoutePage = () => {
  const [officers, setOfficers] = useState(INITIAL_OFFICERS);
  const [manualMode, setManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(INITIAL_OFFICERS[0]);
  
  const mapCenter = [13.0418, 80.2341];

  // --- GPS SIMULATION HEARTBEAT ---
  useEffect(() => {
    const interval = setInterval(() => {
      setOfficers(prev => prev.map(off => ({
        ...off,
        lat: off.lat + (Math.random() - 0.5) * 0.002,
        lng: off.lng + (Math.random() - 0.5) * 0.002,
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateAIPath = async () => {
    setIsLoading(true);
    // Simulated path data for visualization
    setTimeout(() => {
      const simulatedPath = [
        { order: 1, zone_name: 'T. Nagar', lat: 13.0418, lng: 80.2341, priority: 'High', time: '20:30' },
        { order: 2, zone_name: 'Mount Road', lat: 13.0533, lng: 80.2450, priority: 'Medium', time: '21:15' },
        { order: 3, zone_name: 'Anna Salai', lat: 13.0633, lng: 80.2500, priority: 'High', time: '22:00' },
      ];
      setRoutePlan(simulatedPath);
      setIsLoading(false);
    }, 1200);
  };

  const handleManualWaypoint = (latlng) => {
    const newWaypoint = {
      order: routePlan.length + 1,
      zone_name: `Point ${routePlan.length + 1}`,
      lat: latlng.lat,
      lng: latlng.lng,
      priority: 'Manual',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRoutePlan([...routePlan, newWaypoint]);
  };

  const clearRoute = () => setRoutePlan([]);

  const routePolyline = useMemo(() => routePlan.map(p => [p.lat, p.lng]), [routePlan]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>Patrol & Fleet Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Real-time GPS tracking and interactive asset dispatch</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
             <button 
              onClick={() => setManualMode(false)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: 'none', background: !manualMode ? 'var(--primary-color)' : 'transparent', color: 'white', cursor: 'pointer' }}>
               AI ASSIST
             </button>
             <button 
              onClick={() => setManualMode(true)}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: 'none', background: manualMode ? '#FFD60A' : 'transparent', color: manualMode ? 'black' : 'var(--text-secondary)', cursor: 'pointer' }}>
               MANUAL OVERRIDE
             </button>
          </div>
          <button onClick={generateAIPath} className="btn-primary" disabled={isLoading}>
            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            <span>{manualMode ? 'RE-CALCULATE OPTIMAL' : 'GENERATE PATROL'}</span>
          </button>
        </div>
      </div>

      {/* --- REAL-TIME DASHBOARD --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: '600px' }}>
        
        {/* LEFT: FLEET STATUS */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <Activity size={18} color="var(--primary-color)" /> Fleet Live Feed
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {officers.map(off => (
              <motion.div 
                key={off.id}
                onClick={() => setSelectedOfficer(off)}
                whileHover={{ x: 4 }}
                style={{ 
                  padding: '14px', 
                  borderRadius: '12px', 
                  background: selectedOfficer?.id === off.id ? 'rgba(58,134,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedOfficer?.id === off.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 4px' }}>{off.name}</h4>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: off.status === 'Responding' ? 'rgba(255,77,79,0.1)' : 'rgba(58,134,255,0.1)', color: off.status === 'Responding' ? '#FF4D4F' : '#3A86FF', fontWeight: '900' }}>
                      {off.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', margin: 0 }}>{off.speed}</p>
                    <p style={{ fontSize: '0.6rem', opacity: 0.6, margin: 0 }}>🔋 {off.battery}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div style={{ padding: '20px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.5, letterSpacing: '1px', marginBottom: '8px' }}>ACTIVE ROUTE SEGMENTS</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>{routePlan.length} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Waypoints</span></span>
              {routePlan.length > 0 && (
                <button onClick={clearRoute} style={{ background: 'none', border: 'none', color: '#FF4D4F', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700' }}>
                  <Trash2 size={14} /> CLEAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE MAP */}
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          {manualMode && (
             <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, background: '#FFD60A', color: 'black', padding: '8px 16px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '900', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={16} /> MANUAL DISPATCH ACTIVE - CLICK MAP TO ADD WAYPOINTS
             </div>
          )}

          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
            <MapClickHandler enabled={manualMode} onMapClick={handleManualWaypoint} />

            {/* OFFICER GPS MARKERS */}
            {officers.map(off => (
              <Marker key={off.id} position={[off.lat, off.lng]} icon={new L.DivIcon({
                className: 'officer-marker-div',
                html: `<div style="width: 32px; height: 32px; background: #3A86FF; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 0 15px rgba(58,134,255,0.6); position: relative;">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                         ${off.status === 'Responding' ? '<div class="radar-ping"></div>' : ''}
                       </div>`
              })}>
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong>{off.name}</strong><br/>
                    <small>Status: {off.status}</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* ROUTE VISUALIZATION */}
            {routePlan.length > 0 && <Polyline positions={routePolyline} color={manualMode ? '#FFD60A' : 'var(--primary-color)'} weight={4} dashArray={manualMode ? '1, 10' : ''} />}
            
            {routePlan.map((p, i) => (
              <Marker key={`wp-${i}`} position={[p.lat, p.lng]} icon={new L.DivIcon({
                className: 'waypoint-marker-div',
                html: `<div style="width: 24px; height: 24px; background: #1C2541; border: 2.5px solid ${p.priority === 'High' ? '#FF4D4F' : manualMode ? '#FFD60A' : '#52C41A'}; border-radius: 50%; color: white; display: flex; alignItems: center; justifyContent: center; font-size: 10px; font-weight: 900; line-height: 20px; text-align: center;">${i+1}</div>`
              })} />
            ))}
          </MapContainer>
        </div>

      </div>

      {/* --- COMMAND LOG --- */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={18} color="var(--primary-color)" /> Patrol Execution Pipeline
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {routePlan.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', opacity: 0.4 }}>
              <Navigation size={48} style={{ marginBottom: '12px' }} />
              <p>No active route commands. Use AI Assist or Manual Dispatch to start.</p>
            </div>
          ) : (
            routePlan.map((p, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ minWidth: '40px', height: '40px', borderRadius: '10px', background: p.priority === 'High' ? 'rgba(255,77,79,0.1)' : 'rgba(58,134,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.priority === 'High' ? '#FF4D4F' : '#3A86FF', fontSize: '1.1rem', fontWeight: '900' }}>
                  {i + 1}
                </div>
                <div>
                   <p style={{ fontSize: '0.85rem', fontWeight: '800', margin: 0 }}>{p.zone_name}</p>
                   <p style={{ fontSize: '0.7rem', opacity: 0.6, margin: '2px 0 0' }}>{p.time} • {p.priority} Priority</p>
                </div>
                {p.priority === 'Manual' && <Edit3 size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .officer-marker-div { background: none !important; border: none !important; }
        .waypoint-marker-div { background: none !important; border: none !important; }
        .radar-ping {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #FF4D4F;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: -1;
        }
        @keyframes ping {
          75%, 100% { transform: scale(3.5); opacity: 0; }
        }
        .leaflet-container { background: #0b132b !important; }
      `}</style>
    </div>
  );
};

export default PatrolRoutePage;
