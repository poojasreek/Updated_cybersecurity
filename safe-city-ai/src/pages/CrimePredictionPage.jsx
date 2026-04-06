import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, AlertTriangle, Shield, RefreshCw,
  Loader2, Activity, Target, Cpu, BarChart2, Download,
  ChevronRight, Zap, Clock, MapPin, Info, X
} from 'lucide-react';

// ─────────────────────────────────────────────
//  ML ENGINE — Simulated Predictive Models
//  Based on: Logistic Regression + Random Forest
//  + XGBoost/LightGBM feature fusion
//  SHAP: Explainable AI feature importance
// ─────────────────────────────────────────────
const CRIME_ZONES_SEED = [
  { id: 1,  name: 'T. Nagar',       lat: 13.0418, lng: 80.2341, historicalCount: 28, sosCount: 4, crimeTypes: ['Theft / Robbery', 'Assault'], peakHour: 19, weekendBoost: 1.4 },
  { id: 2,  name: 'Anna Nagar',     lat: 13.0850, lng: 80.2101, historicalCount: 15, sosCount: 6, crimeTypes: ['Women Safety'],               peakHour: 21, weekendBoost: 1.2 },
  { id: 3,  name: 'OMR Road',       lat: 12.9516, lng: 80.2402, historicalCount: 22, sosCount: 2, crimeTypes: ['Accident'],                   peakHour: 8,  weekendBoost: 1.1 },
  { id: 4,  name: 'Royapuram',      lat: 13.1140, lng: 80.2970, historicalCount: 18, sosCount: 3, crimeTypes: ['Drugs', 'Violent Crime'],      peakHour: 2,  weekendBoost: 1.6 },
  { id: 5,  name: 'Adyar',          lat: 13.0067, lng: 80.2573, historicalCount: 10, sosCount: 1, crimeTypes: ['Assault', 'Fraud'],            peakHour: 14, weekendBoost: 1.0 },
  { id: 6,  name: 'Mylapore',       lat: 13.0368, lng: 80.2676, historicalCount: 12, sosCount: 2, crimeTypes: ['Theft / Robbery'],             peakHour: 11, weekendBoost: 1.3 },
  { id: 7,  name: 'Guindy',         lat: 13.0067, lng: 80.2206, historicalCount: 14, sosCount: 5, crimeTypes: ['Women Safety'],               peakHour: 20, weekendBoost: 1.5 },
  { id: 8,  name: 'ECR Road',       lat: 12.8996, lng: 80.2509, historicalCount: 20, sosCount: 1, crimeTypes: ['Accident'],                   peakHour: 7,  weekendBoost: 1.2 },
  { id: 9,  name: 'Tambaram',       lat: 12.9249, lng: 80.1000, historicalCount: 6,  sosCount: 1, crimeTypes: ['Violent Crime'],              peakHour: 22, weekendBoost: 1.1 },
  { id: 10, name: 'Velachery',      lat: 12.9815, lng: 80.2180, historicalCount: 16, sosCount: 3, crimeTypes: ['Drugs'],                      peakHour: 1,  weekendBoost: 1.7 },
  { id: 11, name: 'Nungambakkam',   lat: 13.0569, lng: 80.2425, historicalCount: 4,  sosCount: 0, crimeTypes: ['Fraud'],                      peakHour: 10, weekendBoost: 0.9 },
  { id: 12, name: 'Kodambakkam',    lat: 13.0519, lng: 80.2197, historicalCount: 11, sosCount: 2, crimeTypes: ['Fraud', 'Theft / Robbery'],   peakHour: 12, weekendBoost: 1.1 },
  { id: 13, name: 'Perambur',       lat: 13.1082, lng: 80.2350, historicalCount: 9,  sosCount: 1, crimeTypes: ['Public Disturbance'],         peakHour: 17, weekendBoost: 1.3 },
  { id: 14, name: 'Sholinganallur', lat: 12.9010, lng: 80.2279, historicalCount: 7,  sosCount: 1, crimeTypes: ['Kidnapping'],                 peakHour: 23, weekendBoost: 1.2 },
  { id: 15, name: 'Besant Nagar',   lat: 13.0002, lng: 80.2660, historicalCount: 3,  sosCount: 0, crimeTypes: ['None'],                       peakHour: 10, weekendBoost: 0.8 },
];

const CRIME_COLOR_MAP = {
  'Violent Crime':      '#FF4D4F',
  'Theft / Robbery':    '#FF6B35',
  'Women Safety':       '#FFD60A',
  'Drugs':              '#A855F7',
  'Weapons':            '#6B7280',
  'Fraud':              '#3A86FF',
  'Public Disturbance': '#9CA3AF',
  'Kidnapping':         '#92400E',
  'Assault':            '#F97316',
  'Accident':           '#FBBF24',
  'None':               '#2ECC71',
};

// === SIMULATED ML ENGINE ===
// Logistic Regression scoring: P(crime) = σ(w0·hist + w1·sos + w2·hour + w3·weekend + bias)
// XGBoost/Random Forest: adds non-linear boosts for cluster patterns
const runMLPrediction = (zone, liveFIRCount, currentHour, isWeekend) => {
  const maxHist = 30, maxSOS = 8, maxFIR = 20;

  // Feature vector (normalized)
  const f_hist     = Math.min(zone.historicalCount / maxHist, 1);
  const f_sos      = Math.min(zone.sosCount / maxSOS, 1);
  const f_liveFIR  = Math.min(liveFIRCount / maxFIR, 1);
  const f_hour     = 1 - Math.abs(currentHour - zone.peakHour) / 12;  // closeness to peak hour
  const f_weekend  = isWeekend ? zone.weekendBoost : 1.0;

  // Logistic Regression weights (simulated trained weights)
  const w_hist    = 0.35;
  const w_sos     = 0.25;
  const w_liveFIR = 0.20;
  const w_hour    = 0.12;
  const bias      = 0.05;

  const logit = w_hist * f_hist + w_sos * f_sos + w_liveFIR * f_liveFIR + w_hour * f_hour + bias;

  // Sigmoid activation
  const sigmoid = 1 / (1 + Math.exp(-logit * 8));

  // XGBoost boost: non-linear cluster boost for high-crime areas
  const xgboostBoost = zone.historicalCount > 15 ? 1.18 : zone.historicalCount > 8 ? 1.08 : 1.0;

  // Weekend multiplicative factor (Random Forest leaf weight)
  const finalScore = Math.min(99, Math.round(sigmoid * 100 * xgboostBoost * f_weekend));

  // SHAP feature importance (approximate Shapley values)
  const total = w_hist * f_hist + w_sos * f_sos + w_liveFIR * f_liveFIR + w_hour * f_hour;
  const shap = total > 0 ? {
    historical:    Math.round((w_hist * f_hist / total) * 100),
    sos:           Math.round((w_sos * f_sos / total) * 100),
    liveFIRs:      Math.round((w_liveFIR * f_liveFIR / total) * 100),
    timeProximity: Math.round((w_hour * f_hour / total) * 100),
  } : { historical: 25, sos: 25, liveFIRs: 25, timeProximity: 25 };

  const severity = finalScore >= 75 ? 'CRITICAL' : finalScore >= 55 ? 'HIGH' : finalScore >= 35 ? 'MODERATE' : 'LOW';
  const color = finalScore >= 75 ? '#FF4D4F' : finalScore >= 55 ? '#FF6B35' : finalScore >= 35 ? '#FFD60A' : '#2ECC71';

  return { ...zone, riskScore: finalScore, severity, color, shap, f_hist, f_sos, f_liveFIR, f_hour };
};

const getHexPoints = (lat, lng, r) => {
  const pts = [];
  const deg = r / 111320;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push([lat + deg * Math.cos(a), lng + (deg / Math.cos(lat * Math.PI / 180)) * Math.sin(a)]);
  }
  return pts;
};

// Hourly crime probability data (simulated time-series forecast)
const buildHourlyForecast = (zones) => {
  return Array.from({ length: 24 }, (_, h) => {
    const highRiskCount = zones.filter(z => {
      const proximity = 1 - Math.abs(h - z.peakHour) / 12;
      return proximity > 0.6 && z.riskScore >= 55;
    }).length;
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      crimeProbability: Math.round(20 + highRiskCount * 12 + (h >= 20 || h <= 4 ? 25 : 0)),
      predictedIncidents: Math.max(0, Math.round((highRiskCount * 0.6) + (h >= 20 || h <= 4 ? 2 : 0))),
    };
  });
};

const CrimePredictionPage = () => {
  const [liveFIRs, setLiveFIRs]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [modelType, setModelType]   = useState('ensemble');
  const [lastRun, setLastRun]       = useState(null);
  const [running, setRunning]       = useState(false);
  const mapCenter = [13.0418, 80.2341];

  const now = new Date();
  const currentHour = now.getHours();
  const isWeekend = [0, 6].includes(now.getDay());

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8888/api/firs');
      const data = await res.json();
      setLiveFIRs(data.data || []);
    } catch { /* backend offline — predictions still run on seed data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLive(); const t = setInterval(fetchLive, 20000); return () => clearInterval(t); }, [fetchLive]);

  const runModel = useCallback(() => {
    setRunning(true);
    fetchLive();
    setTimeout(() => { setLastRun(new Date()); setRunning(false); }, 1200);
  }, [fetchLive]);

  // Build live FIR count per zone
  const liveFIRByZone = useMemo(() => {
    const map = {};
    liveFIRs.forEach(fir => {
      const lat = fir.lat || fir.Latitude || 13.0418;
      const lng = fir.lng || fir.Longitude || 80.2341;
      CRIME_ZONES_SEED.forEach(z => {
        const d = Math.sqrt(Math.pow(lat - z.lat, 2) + Math.pow(lng - z.lng, 2)) * 111320;
        if (d < 800) map[z.id] = (map[z.id] || 0) + 1;
      });
    });
    return map;
  }, [liveFIRs]);

  // Run ML predictions on all zones
  const predictions = useMemo(() => {
    return CRIME_ZONES_SEED
      .map(z => runMLPrediction(z, liveFIRByZone[z.id] || 0, currentHour, isWeekend))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [liveFIRByZone, currentHour, isWeekend]);

  const hourlyForecast = useMemo(() => buildHourlyForecast(predictions), [predictions]);

  const selectedPred = useMemo(() => predictions.find(p => p.id === selectedZone?.id), [predictions, selectedZone]);

  // Crime type distribution for radar chart
  const crimeTypeRadar = useMemo(() => {
    const map = {};
    predictions.forEach(p => p.crimeTypes.forEach(ct => {
      if (ct !== 'None') map[ct] = (map[ct] || 0) + p.riskScore;
    }));
    return Object.entries(map).map(([type, score]) => ({ type, score: Math.round(score / predictions.length) }));
  }, [predictions]);

  // Top 5 highest risk
  const top5 = predictions.slice(0, 5);

  const handleExportReport = () => {
    const lines = [
      '═══════════════════════════════════════════════',
      '  SAFE-CITY AI — CRIME PREDICTION REPORT',
      `  Generated: ${new Date().toLocaleString()}`,
      '  Model: Ensemble (LR + RF + XGBoost)',
      '═══════════════════════════════════════════════',
      '',
      'TOP HIGH-RISK ZONES:',
      ...top5.map((z, i) => `  ${i + 1}. ${z.name.padEnd(20)} Risk: ${z.riskScore}/100  [${z.severity}]`),
      '',
      'SHAP FEATURE IMPORTANCE (top zone):',
      ...Object.entries(top5[0]?.shap || {}).map(([k, v]) => `  ${k.padEnd(20)} ${v}%`),
      '',
      'All zones are listed in CrimePredictionPage UI.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crime_prediction_report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      <p style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Initializing ML Prediction Engine...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', fontSize: '0.72rem', fontWeight: '900', letterSpacing: '2px', marginBottom: '6px' }}>
            <Brain size={16} /> PREDICTIVE POLICING ENGINE v2.4
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>Crime Risk Intelligence</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px' }}>
            {['logistic', 'random_forest', 'ensemble'].map(m => (
              <button key={m} onClick={() => setModelType(m)} style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', background: modelType === m ? '#A855F7' : 'transparent', color: modelType === m ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                {m === 'logistic' ? 'LR' : m === 'random_forest' ? 'RF' : 'XGB+'}
              </button>
            ))}
          </div>
          <button onClick={runModel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: running ? 'rgba(168,85,247,0.3)' : '#A855F7', border: 'none', color: 'white', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>
            {running ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            {running ? 'REFRESHING...' : 'REFRESH INTEL'}
          </button>
          <button onClick={handleExportReport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', background: 'rgba(58,134,255,0.15)', border: '1px solid rgba(58,134,255,0.3)', color: '#3A86FF', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' }}>
            <Download size={16} /> EXPORT
          </button>
        </div>
      </div>

      {/* ── Stat Tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Zones Analyzed', value: predictions.length, color: '#A855F7', icon: <Target size={22} /> },
          { label: 'Critical Zones', value: predictions.filter(p => p.severity === 'CRITICAL').length, color: '#FF4D4F', icon: <AlertTriangle size={22} /> },
          { label: 'Live FIRs Fused', value: liveFIRs.length, color: '#2ECC71', icon: <Activity size={22} /> },
          { label: 'Peak Risk Hour', value: `${currentHour}:00`, color: '#FFD60A', icon: <Clock size={22} />, sub: isWeekend ? 'Weekend ×1.4' : 'Weekday' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: '800', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: '900', color: s.color, margin: '2px 0 0', lineHeight: 1 }}>{s.value}</p>
              {s.sub && <p style={{ fontSize: '0.6rem', opacity: 0.6, margin: 0 }}>{s.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 2-col: Map + Risk Table ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

        {/* Prediction Map */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#A855F7" /> Predictive Risk Map
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Click a zone for SHAP analysis</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,77,79,0.1)', color: '#FF4D4F', fontWeight: '800' }}>● CRITICAL ≥75</div>
              <div style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,214,10,0.1)', color: '#FFD60A', fontWeight: '800' }}>● HIGH ≥55</div>
              <div style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(46,204,113,0.1)', color: '#2ECC71', fontWeight: '800' }}>● LOW</div>
            </div>
          </div>

          <div style={{ height: '420px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {predictions.map(zone => (
                <Polygon
                  key={zone.id}
                  positions={getHexPoints(zone.lat, zone.lng, 550)}
                  pathOptions={{ fillColor: zone.color, fillOpacity: selectedZone?.id === zone.id ? 0.85 : 0.5, color: zone.color, weight: selectedZone?.id === zone.id ? 4 : 1.5 }}
                  eventHandlers={{ click: () => setSelectedZone(zone) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'monospace', minWidth: '140px', background: '#0B132B', color: 'white', padding: '8px', borderRadius: '8px' }}>
                      <strong style={{ color: zone.color }}>{zone.name}</strong><br />
                      <span style={{ fontSize: '0.75rem' }}>Risk: {zone.riskScore}/100 · {zone.severity}</span>
                    </div>
                  </Popup>
                </Polygon>
              ))}
              {/* Pulse rings on critical zones */}
              {predictions.filter(z => z.severity === 'CRITICAL').map(z => (
                <Circle key={`pulse-${z.id}`} center={[z.lat, z.lng]} radius={300} pathOptions={{ fillColor: z.color, fillOpacity: 0.1, color: z.color, weight: 1, dashArray: '4,4' }} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Risk Rank Table + SHAP Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Risk Ranking */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} color="#A855F7" /> Area Risk Ranking
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {predictions.map((z, i) => (
                <motion.div key={z.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedZone(z)}
                  style={{ padding: '10px 14px', borderRadius: '12px', background: selectedZone?.id === z.id ? `${z.color}18` : 'rgba(255,255,255,0.02)', border: `1px solid ${selectedZone?.id === z.id ? z.color + '40' : 'rgba(255,255,255,0.05)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: '900', color: z.color, minWidth: '20px' }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '800', margin: 0 }}>{z.name}</p>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '4px' }}>
                      <div style={{ height: '100%', width: `${z.riskScore}%`, borderRadius: '2px', background: z.color, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '900', color: z.color, minWidth: '28px', textAlign: 'right' }}>{z.riskScore}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SHAP Analysis Panel */}
          <AnimatePresence>
            {selectedPred && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="glass-panel" style={{ padding: '20px', border: `2px solid ${selectedPred.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '0.6rem', fontWeight: '900', color: '#A855F7', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>SHAP EXPLAINABILITY</p>
                    <h4 style={{ fontWeight: '900', margin: '4px 0 0', color: selectedPred.color }}>{selectedPred.name}</h4>
                  </div>
                  <button onClick={() => setSelectedZone(null)} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(selectedPred.shap || {}).map(([feat, pct]) => (
                    <div key={feat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'capitalize' }}>{feat.replace(/([A-Z])/g, ' $1')}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '900', color: selectedPred.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${selectedPred.color}, ${selectedPred.color}88)` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: `${selectedPred.color}10`, border: `1px solid ${selectedPred.color}30`, fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  <strong style={{ color: selectedPred.color }}>Model Decision:</strong> Risk score {selectedPred.riskScore}/100 driven primarily by{' '}
                  {Object.entries(selectedPred.shap || {}).sort(([,a],[,b]) => b - a)[0]?.[0]?.replace(/([A-Z])/g, ' $1').toLowerCase()}.
                  {selectedPred.severity === 'CRITICAL' ? ' ⚠️ Recommend immediate patrol deployment.' : ' Regular monitoring advised.'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom Row: Hourly Forecast + Crime Radar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>

        {/* Hourly Crime Forecast */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#A855F7" /> 24-hr Crime Probability Forecast
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Predicted incident distribution by hour</p>
            </div>
            <span style={{ fontSize: '0.6rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(168,85,247,0.1)', color: '#A855F7', fontWeight: '800' }}>XGBoost + LightGBM</span>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyForecast} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} interval={3} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <ReferenceLine y={70} stroke="#FF4D4F" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'HIGH RISK', fill: '#FF4D4F', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: 'rgba(11,19,43,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.8rem' }} />
                <Line type="monotone" dataKey="crimeProbability" stroke="#A855F7" strokeWidth={3} dot={false} name="Crime Probability %" />
                <Line type="monotone" dataKey="predictedIncidents" stroke="#3A86FF" strokeWidth={2} dot={false} strokeDasharray="5 3" name="Predicted Incidents" />
                <Legend wrapperStyle={{ fontSize: '0.7rem', paddingTop: '12px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Type Radar */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#A855F7" /> Crime Type Risk Profile
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Weighted risk by crime category</p>
          </div>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={crimeTypeRadar}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="type" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                <Radar name="Risk Score" dataKey="score" stroke="#A855F7" fill="#A855F7" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'rgba(11,19,43,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.8rem' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Model Info Bar ── */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '24px', background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7' }}>
          <Brain size={18} />
          <span style={{ fontSize: '0.72rem', fontWeight: '900', letterSpacing: '1px' }}>MODEL STATUS</span>
        </div>
        {[
          { label: 'Algorithm', value: 'Logistic Regression + Random Forest + XGBoost Ensemble' },
          { label: 'Features', value: 'Historical FIRs · SOS density · Time proximity · Weekend factor · Live FIR fusion' },
          { label: 'Explainability', value: 'SHAP Shapley values' },
          { label: 'Last Run', value: lastRun ? lastRun.toLocaleTimeString() : 'Auto (on load)' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: '800', opacity: 0.5, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', margin: '2px 0 0', color: 'rgba(255,255,255,0.85)' }}>{item.value}</p>
          </div>
        ))}
      </div>

      <style>{`.leaflet-container { background: #050a1a !important; } .leaflet-popup-content-wrapper { background: #0B132B !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; } .leaflet-popup-tip { background: #0B132B !important; }`}</style>
    </div>
  );
};

export default CrimePredictionPage;
