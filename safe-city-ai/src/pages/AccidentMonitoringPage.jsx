import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Route, Activity, BarChart3, Map as MapIcon, 
  Wind, CloudRain, Sun, Zap, Shield, Navigation, 
  Download, RefreshCw, Loader2, Info, ChevronRight, Eye
} from 'lucide-react';
import { accidentRecords, roadSafetyHotspots, accidentStats } from '../data/mockData';

// --- HELPER TO SIMULATE AI PREDICTION ---
const calculateAccidentRisk = (visibility, roadCondition, hour) => {
  // Simple weights
  let score = 20; // Baseline
  if (visibility === 'Low') score += 35;
  if (visibility === 'Moderate') score += 15;
  if (roadCondition === 'Wet') score += 25;
  if (roadCondition === 'Damaged') score += 30;
  
  // Peak hour weights (8-10 AM, 5-8 PM)
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    score += 15;
  }
  
  return Math.min(100, score);
};

const AccidentMonitoringPage = () => {
  const [activeTab, setActiveTab] = useState('irad'); // irad, hotspots, ai-prediction
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictParams, setPredictParams] = useState({ visibility: 'High', road: 'Clear', hour: 12 });
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  
  const mapCenter = [13.0633, 80.2500];

  const riskScore = useMemo(() => 
    calculateAccidentRisk(predictParams.visibility, predictParams.road, predictParams.hour), 
  [predictParams]);

  // Simulate Real-time Crash Alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const newAlert = {
          id: Date.now(),
          lat: mapCenter[0] + (Math.random() - 0.5) * 0.1,
          lng: mapCenter[1] + (Math.random() - 0.5) * 0.1,
          time: new Date().toLocaleTimeString(),
          type: 'Minor Crash Reported'
        };
        setRealTimeAlerts(prev => [newAlert, ...prev].slice(0, 5));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Fatal': return '#FF4D4F';
      case 'Grievous': return '#FF7A45';
      case 'Minor': return '#FFC53D';
      default: return '#52C41A';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF7A45', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
            <Activity size={14}/> IRAD INTEGRATED ROAD ACCIDENT DATABASE v4.0
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Accident Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time spatial analytics & AI crash prediction engine</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleRefresh} className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 122, 69, 0.1)', border: '1px solid rgba(255, 122, 69, 0.2)', cursor: 'pointer', transition: 'all 0.3s' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>SYNC DATA</span>
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FF4D4F' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: '700' }}>BROADCAST ADVISORY</span>
          </button>
        </div>
      </div>

      {/* --- QUICK STATS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Crashes (MTD)', value: '1,425', change: '+12%', color: '#FF7A45', icon: <Activity size={24}/> },
          { label: 'Fatalities', value: '84', change: '-5.2%', color: '#FF4D4F', icon: <Zap size={24}/> },
          { label: 'Active Patrol Segments', value: '38', change: 'Live', color: 'var(--primary-color)', icon: <Shield size={24}/> },
          { label: 'AI Risk Confidence', value: '94.2%', change: 'Optimized', color: '#52C41A', icon: <Zap size={24}/> },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>{stat.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stat.value}</span>
                <span style={{ fontSize: '0.7rem', color: stat.change.includes('+') ? '#FF4D4F' : '#52C41A', fontWeight: '800' }}>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MAIN MODULE CONTENT --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', height: '650px' }}>
        
        {/* LEFT: MAP & VISUALIZER */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px' }}>
            {['irad', 'hotspots', 'ai-prediction'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '8px 0', 
                  fontSize: '0.85rem', 
                  fontWeight: '800', 
                  color: activeTab === tab ? '#FF7A45' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${activeTab === tab ? '#FF7A45' : 'transparent'}`,
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {/* ALERT OVERLAY */}
            <AnimatePresence>
              {realTimeAlerts.length > 0 && (
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, width: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  {realTimeAlerts.slice(0, 1).map(alert => (
                    <div key={alert.id} className="glass-panel" style={{ padding: '12px 16px', background: 'rgba(255, 77, 79, 0.15)', border: '1.5px solid #FF4D4F', backdropFilter: 'blur(10px)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ minWidth: '36px', height: '36px', borderRadius: '50%', background: '#FF4D4F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Zap size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: '900', color: '#FF4D4F', margin: 0 }}>CRITICAL ALERT</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', margin: 0 }}>{alert.type}</p>
                        <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
              
              {/* ACCIDENT PRONE HEXAGONS / CIRCLES */}
              {activeTab === 'hotspots' && roadSafetyHotspots.map(hot => (
                <Circle 
                  key={hot.id} 
                  center={[hot.lat, hot.lng]} 
                  radius={600} 
                  pathOptions={{ 
                    fillColor: hot.riskScore > 85 ? '#FF4D4F' : '#FF7A45', 
                    fillOpacity: 0.4, 
                    color: hot.riskScore > 85 ? '#FF4D4F' : '#FF7A45', 
                    weight: 2 
                  }}
                  eventHandlers={{ click: () => setSelectedHotspot(hot) }}
                >
                  <Popup>
                    <div style={{ background: '#0B132B', color: 'white', padding: '8px', borderRadius: '8px', minWidth: '150px' }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#FF7A45' }}>{hot.name}</h4>
                      <p style={{ margin: '0', fontSize: '0.8rem' }}>Risk Score: <strong>{hot.riskScore} / 100</strong></p>
                      <p style={{ margin: '0', fontSize: '0.75rem', opacity: 0.7 }}>Cause: {hot.primaryCause}</p>
                    </div>
                  </Popup>
                </Circle>
              ))}

              {/* LIVE ACCIDENT RECORD MARKERS */}
              {activeTab === 'irad' && accidentRecords.map(acc => (
                <Marker key={acc.id} position={[acc.lat, acc.lng]}>
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 8px', color: getSeverityColor(acc.severity) }}>{acc.severity.toUpperCase()} CRASH</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px', fontSize: '0.75rem' }}>
                        <span style={{ opacity: 0.6 }}>Cause:</span> <strong>{acc.cause}</strong>
                        <span style={{ opacity: 0.6 }}>Road:</span> <strong>{acc.roadType}</strong>
                        <span style={{ opacity: 0.6 }}>Vehicle:</span> <strong>{acc.vehicleType}</strong>
                        <span style={{ opacity: 0.6 }}>Time:</span> <strong>{acc.time}</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* REAL-TIME ALERTS */}
              {realTimeAlerts.map(alert => (
                <Circle 
                  key={alert.id} 
                  center={[alert.lat, alert.lng]} 
                  radius={200} 
                  pathOptions={{ fillColor: '#FF4949', fillOpacity: 0.8, color: '#FF4949', weight: 4 }}
                  className="pulse-alert"
                />
              ))}

              {/* PATROL SUGGESTIONS (Lines) */}
              {activeTab === 'ai-prediction' && (
                <Polyline 
                  positions={[[13.0633, 80.2500], [13.0067, 80.2206], [12.9633, 80.2450]]} 
                  pathOptions={{ color: 'var(--primary-color)', weight: 4, dashArray: '10, 10' }} 
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT: FEATURE PANELS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* AI PREDICTION / CONTROL PANEL */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#FF7A45" /> AI Risk Forecast
            </h3>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.6, marginBottom: '8px', letterSpacing: '1px' }}>ACCIDENT PROBABILITY</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: riskScore > 70 ? '#FF4D4F' : riskScore > 40 ? '#FF7A45' : '#52C41A', margin: 0 }}>
                {riskScore}%
              </h2>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: riskScore > 70 ? '#FF4D4F' : '#52C41A', marginTop: '4px' }}>
                {riskScore > 70 ? 'CRITICAL RISK DETECTED' : 'SAFE OPERATIONAL LEVELS'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  VISIBILITY <span>{predictParams.visibility}</span>
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['Low', 'Moderate', 'High'].map(v => (
                    <button key={v} onClick={() => setPredictParams(p => ({ ...p, visibility: v }))} 
                      style={{ flex: 1, padding: '6px', fontSize: '0.65rem', borderRadius: '6px', background: predictParams.visibility === v ? '#FF7A45' : 'rgba(255,255,255,0.05)', color: predictParams.visibility === v ? 'white' : 'white', border: 'none', cursor: 'pointer', fontWeight: '800' }}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '700', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  ROAD SURFACE <span>{predictParams.road}</span>
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['Clear', 'Wet', 'Damaged'].map(r => (
                    <button key={r} onClick={() => setPredictParams(p => ({ ...p, road: r }))} 
                      style={{ flex: 1, padding: '6px', fontSize: '0.65rem', borderRadius: '6px', background: predictParams.road === r ? '#FF7A45' : 'rgba(255,255,255,0.05)', color: predictParams.road === r ? 'white' : 'white', border: 'none', cursor: 'pointer', fontWeight: '800' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PATROL SUGGESTIONS */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Route size={18} color="var(--primary-color)" /> Smart Patrol Suggester
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {roadSafetyHotspots.map((hot, i) => (
                <div key={hot.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: '900' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '800', margin: 0 }}>{hot.name}</p>
                    <p style={{ fontSize: '0.65rem', opacity: 0.6, margin: 0 }}>Expected Risk: {hot.riskScore}%</p>
                  </div>
                  <ChevronRight size={16} opacity={0.3} />
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', marginTop: 'auto', fontSize: '0.75rem', padding: '12px', background: 'var(--primary-color)20', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
                GENERATE OPTIMAL ROUTE
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- ANALYTICS ROW --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', height: '300px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#FF7A45" /> Monthly Crash Volume (MTD)
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={accidentStats.monthlyAccidents}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1C2541', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
              <Bar dataKey="count" fill="rgba(255, 122, 69, 0.4)" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="fatal" fill="#FF4D4F" radius={[4, 4, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-panel" style={{ padding: '24px', height: '300px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#34D399" /> 24hr Accident Distribution
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={accidentStats.hourlyTrend}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1C2541', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="count" stroke="#34D399" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style>{`
        .pulse-alert {
          animation: mapPulse 1.5s infinite;
        }
        @keyframes mapPulse {
          0% { stroke-width: 4; stroke-opacity: 0.8; r: 200; }
          70% { stroke-width: 15; stroke-opacity: 0; r: 600; }
          100% { stroke-width: 0; stroke-opacity: 0; r: 200; }
        }
        .leaflet-container { background: #0b132b !important; }
      `}</style>
    </div>
  );
};

export default AccidentMonitoringPage;
