import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, XCircle, Loader2, Activity,
  MapPin, RefreshCw, Eye, Lock, Layers
} from 'lucide-react';

// =============================================
// IPC / LAW SECTION REFERENCE DATABASE
// =============================================
const ipcSectionDB = {
  'Violent Crime': {
    law: 'IPC', color: '#FF4D4F', bg: 'rgba(255,77,79,0.12)', icon: '🔴',
    sections: [
      { sec: '302', desc: 'Murder' }, { sec: '304-B', desc: 'Dowry Death' },
      { sec: '307', desc: 'Attempt to Murder' }, { sec: '322', desc: 'Grievous Hurt' },
      { sec: '324', desc: 'Voluntarily Causing Hurt' }, { sec: '351', desc: 'Assault' },
    ]
  },
  'Theft / Robbery': {
    law: 'IPC', color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', icon: '🟠',
    sections: [
      { sec: '379', desc: 'Theft' }, { sec: '380', desc: 'Theft in Dwelling' },
      { sec: '383', desc: 'Extortion' }, { sec: '390', desc: 'Robbery' },
      { sec: '391', desc: 'Dacoity' }, { sec: '392', desc: 'Punishment for Robbery' },
      { sec: '395', desc: 'Punishment for Dacoity' }, { sec: '396', desc: 'Dacoity with Murder' },
      { sec: '397', desc: 'Robbery with Harm' }, { sec: '411', desc: 'Receiving Stolen Property' },
      { sec: '441', desc: 'Criminal Trespass' }, { sec: '442', desc: 'House Trespass' },
      { sec: '447', desc: 'Punishment for Trespass' }, { sec: '448', desc: 'Punishment for House Trespass' },
      { sec: '454', desc: 'Lurking House Trespass' }, { sec: '457', desc: 'Night House Trespass' },
    ]
  },
  'Women Safety': {
    law: 'IPC', color: '#FFD60A', bg: 'rgba(255,214,10,0.12)', icon: '🟡',
    sections: [
      { sec: '354', desc: 'Assault / Harassment on Woman' }, { sec: '354-A', desc: 'Sexual Harassment' },
      { sec: '354-D', desc: 'Stalking' }, { sec: '363', desc: 'Kidnapping' },
      { sec: '366', desc: 'Kidnapping / Abduction of Woman' }, { sec: '376', desc: 'Rape' },
      { sec: '498-A', desc: 'Domestic Cruelty / Dowry' }, { sec: '509', desc: 'Word / Gesture Insulting Woman' },
    ]
  },
  'Drugs': {
    law: 'NDPS Act', color: '#A855F7', bg: 'rgba(168,85,247,0.12)', icon: '🟣',
    sections: [
      { sec: '20', desc: 'Possession of Cannabis' }, { sec: '21', desc: 'Sale of Narcotics' },
      { sec: '22', desc: 'Transport of Psychotropics' }, { sec: '27', desc: 'Consumption of Drugs' },
    ]
  },
  'Weapons': {
    law: 'Arms Act', color: '#6B7280', bg: 'rgba(107,114,128,0.2)', icon: '⚫',
    sections: [
      { sec: '25', desc: 'Illegal Arms Possession' }, { sec: '27', desc: 'Use of Arms' },
    ]
  },
  'Fraud': {
    law: 'IPC', color: '#3A86FF', bg: 'rgba(58,134,255,0.12)', icon: '🔵',
    sections: [
      { sec: '420', desc: 'Cheating & Fraud' }, { sec: '465', desc: 'Forgery' },
      { sec: '467', desc: 'Forgery of Valuable Documents' }, { sec: '468', desc: 'Forgery for Cheating' },
      { sec: '470', desc: 'Forged Document' }, { sec: '471', desc: 'Using Forged Document' },
      { sec: '489-A', desc: 'Counterfeiting Currency' },
    ]
  },
  'Public Disturbance': {
    law: 'IPC', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', icon: '⚪',
    sections: [
      { sec: '121', desc: 'Waging War Against State' }, { sec: '141', desc: 'Unlawful Assembly' },
      { sec: '144', desc: 'Orders to Disperse' }, { sec: '146', desc: 'Rioting' },
      { sec: '147', desc: 'Punishment for Rioting' }, { sec: '148', desc: 'Rioting with Deadly Weapons' },
      { sec: '151', desc: 'Knowingly Joining Unlawful Assembly' },
      { sec: '153-A', desc: 'Promoting Enmity between Groups' },
      { sec: '268', desc: 'Public Nuisance' }, { sec: '295-A', desc: 'Religious Insult' },
      { sec: '504', desc: 'Intentional Insult' },
    ]
  },
  'Kidnapping': {
    law: 'IPC', color: '#92400E', bg: 'rgba(146,64,14,0.2)', icon: '🟤',
    sections: [
      { sec: '363', desc: 'Kidnapping' }, { sec: '364', desc: 'Kidnapping for Murder' },
      { sec: '365', desc: 'Kidnapping for Confinement' }, { sec: '366', desc: 'Kidnapping for Forced Marriage' },
    ]
  },
  'Assault': {
    law: 'IPC', color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: '🟠',
    sections: [
      { sec: '351', desc: 'Assault' }, { sec: '352', desc: 'Punishment for Assault' },
      { sec: '324', desc: 'Voluntarily Causing Hurt' }, { sec: '325', desc: 'Grievous Hurt' },
      { sec: '326', desc: 'Hurt by Dangerous Weapon' },
    ]
  },
  'Threat / Extortion': {
    law: 'IPC', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', icon: '🔵',
    sections: [
      { sec: '506', desc: 'Criminal Intimidation' }, { sec: '383', desc: 'Extortion' },
      { sec: '384', desc: 'Punishment for Extortion' },
    ]
  },
  'Corruption': {
    law: 'IPC / Prevention of Corruption Act', color: '#34D399', bg: 'rgba(52,211,153,0.12)', icon: '🟢',
    sections: [
      { sec: '161', desc: 'Bribery by Public Servant' }, { sec: '7', desc: 'PCA: Taking Gratification' },
      { sec: '13', desc: 'PCA: Criminal Misconduct' },
    ]
  },
  'Accident': {
    law: 'IPC / MVA', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', icon: '🟡',
    sections: [
      { sec: '279', desc: 'Rash / Negligent Driving' }, { sec: '304-A', desc: 'Causing Death by Negligence' },
      { sec: '337', desc: 'Causing Hurt by Act Endangering Life' }, { sec: '338', desc: 'Causing Grievous Hurt' },
    ]
  },
  'NDPS': {
    law: 'NDPS Act', color: '#A855F7', bg: 'rgba(168,85,247,0.12)', icon: '🟣',
    sections: [
      { sec: '20', desc: 'Possession of Cannabis' }, { sec: '21', desc: 'Sale of Narcotics' },
      { sec: '22', desc: 'Transport of Psychotropics' },
    ]
  },
  'IPC': {
    law: 'IPC', color: '#6366F1', bg: 'rgba(99,102,241,0.12)', icon: '🔵',
    sections: [
      { sec: '302', desc: 'Murder' }, { sec: '307', desc: 'Attempt to Murder' },
      { sec: '379', desc: 'Theft' }, { sec: '420', desc: 'Fraud/Cheating' },
      { sec: '506', desc: 'Criminal Intimidation' },
    ]
  },
};

// Chennai crime zones seed data (will be augmented by live FIR data)
const SEED_ZONES = [
  { id: 1, name: 'T. Nagar', area: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341, radius: 600, crimeCount: 28, riskScore: 85, dominantCrime: 'Theft / Robbery', severity: 'high', recentCrimes: ['Chain snatching', 'Pickpocketing', 'Shoplifting'] },
  { id: 2, name: 'Anna Nagar', area: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, radius: 500, crimeCount: 15, riskScore: 72, dominantCrime: 'Women Safety', severity: 'high', recentCrimes: ['Stalking', 'Eve-teasing', 'Harassment'] },
  { id: 3, name: 'OMR Road', area: 'OMR Zone', lat: 12.9516, lng: 80.2402, radius: 700, crimeCount: 22, riskScore: 60, dominantCrime: 'Accident', severity: 'medium', recentCrimes: ['Vehicle collision', 'Hit-and-run', 'Drunk driving'] },
  { id: 4, name: 'Royapuram', area: 'Royapuram Zone', lat: 13.1140, lng: 80.2970, radius: 450, crimeCount: 18, riskScore: 78, dominantCrime: 'Drugs', severity: 'high', recentCrimes: ['Drug trafficking', 'Substance abuse'] },
  { id: 5, name: 'Adyar', area: 'Adyar Zone', lat: 13.0067, lng: 80.2573, radius: 500, crimeCount: 10, riskScore: 40, dominantCrime: 'Assault', severity: 'medium', recentCrimes: ['Assault', 'Property dispute'] },
  { id: 6, name: 'Mylapore', area: 'Mylapore Zone', lat: 13.0368, lng: 80.2676, radius: 400, crimeCount: 12, riskScore: 55, dominantCrime: 'Theft / Robbery', severity: 'medium', recentCrimes: ['Vehicle theft', 'Bag snatching'] },
  { id: 7, name: 'Guindy', area: 'Guindy Zone', lat: 13.0067, lng: 80.2206, radius: 550, crimeCount: 14, riskScore: 68, dominantCrime: 'Women Safety', severity: 'high', recentCrimes: ['Eve-teasing', 'Stalking'] },
  { id: 8, name: 'ECR Road', area: 'ECR Zone', lat: 12.8996, lng: 80.2509, radius: 800, crimeCount: 20, riskScore: 65, dominantCrime: 'Accident', severity: 'medium', recentCrimes: ['Hit-and-run', 'Speeding crash'] },
  { id: 9, name: 'Tambaram', area: 'Tambaram', lat: 12.9249, lng: 80.1000, radius: 500, crimeCount: 6, riskScore: 25, dominantCrime: 'Violent Crime', severity: 'low', recentCrimes: ['Property dispute'] },
  { id: 10, name: 'Velachery', area: 'Velachery', lat: 12.9815, lng: 80.2180, radius: 500, crimeCount: 16, riskScore: 70, dominantCrime: 'Drugs', severity: 'high', recentCrimes: ['Drug raid', 'Illegal substance'] },
  { id: 11, name: 'Nungambakkam', area: 'Nungambakkam', lat: 13.0569, lng: 80.2425, radius: 400, crimeCount: 3, riskScore: 12, dominantCrime: 'None', severity: 'safe', recentCrimes: [] },
  { id: 12, name: 'Besant Nagar', area: 'Besant Nagar', lat: 13.0002, lng: 80.2660, radius: 450, crimeCount: 2, riskScore: 8, dominantCrime: 'None', severity: 'safe', recentCrimes: [] },
  { id: 13, name: 'Kodambakkam', area: 'Kodambakkam', lat: 13.0519, lng: 80.2197, radius: 480, crimeCount: 11, riskScore: 52, dominantCrime: 'Fraud', severity: 'medium', recentCrimes: ['Online fraud', 'Cheating case'] },
  { id: 14, name: 'Perambur', area: 'Perambur', lat: 13.1082, lng: 80.2350, radius: 520, crimeCount: 9, riskScore: 45, dominantCrime: 'Public Disturbance', severity: 'low', recentCrimes: ['Unlawful assembly'] },
  { id: 15, name: 'Sholinganallur', area: 'Sholinganallur', lat: 12.9010, lng: 80.2279, radius: 600, crimeCount: 7, riskScore: 35, dominantCrime: 'Kidnapping', severity: 'medium', recentCrimes: ['Missing person'] },
];

const getHexagonPoints = (lat, lng, radiusInMeters) => {
  const points = [];
  const radiusInDegrees = radiusInMeters / 111320;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const pLat = lat + radiusInDegrees * Math.cos(angle);
    const pLng = lng + (radiusInDegrees / Math.cos((lat * Math.PI) / 180)) * Math.sin(angle);
    points.push([pLat, pLng]);
  }
  return points;
};

const getZoneColor = (zone) => {
  if (zone.severity === 'safe') return '#2ECC71';
  const cls = ipcSectionDB[zone.dominantCrime];
  if (cls) return cls.color;
  return zone.severity === 'high' ? '#FF4D4F' : '#95A5A6';
};

const getSeverityLabel = (score) => {
  if (score >= 75) return { label: 'CRITICAL', color: '#FF4D4F' };
  if (score >= 55) return { label: 'HIGH RISK', color: '#FF6B35' };
  if (score >= 35) return { label: 'MODERATE', color: '#FFD60A' };
  return { label: 'LOW RISK', color: '#2ECC71' };
};

const ALL_CRIME_TYPES = ['All', ...Object.keys(ipcSectionDB)];

const HotspotMapPage = () => {
  const [liveFIRs, setLiveFIRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [lastSync, setLastSync] = useState(null);
  const mapCenter = [13.0418, 80.2341];

  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8888/api/firs');
      const data = await res.json();
      setLiveFIRs(data.data || []);
      setLastSync(new Date());
    } catch (e) {
      console.warn('Backend offline — using seed zone data only.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  // Augment seed zones with live FIR data (crime count boost)
  const zones = useMemo(() => {
    return SEED_ZONES.map(zone => {
      const nearby = liveFIRs.filter(fir => {
        const lat = fir.lat || 13.0418;
        const lng = fir.lng || 80.2341;
        const dist = Math.sqrt(Math.pow(lat - zone.lat, 2) + Math.pow(lng - zone.lng, 2)) * 111320;
        return dist < zone.radius * 1.5;
      });
      const boost = nearby.length;
      const newCount = zone.crimeCount + boost;
      const newRisk = Math.min(99, zone.riskScore + boost * 3);
      return { ...zone, crimeCount: newCount, riskScore: newRisk, liveFIRs: nearby };
    });
  }, [liveFIRs]);

  const filteredZones = useMemo(() => {
    if (selectedType === 'All') return zones;
    return zones.filter(z => z.dominantCrime === selectedType || z.dominantCrime.includes(selectedType));
  }, [zones, selectedType]);

  const zoneIPCSections = useMemo(() => {
    if (!selectedZone) return null;
    return ipcSectionDB[selectedZone.dominantCrime] || null;
  }, [selectedZone]);

  const totalCrimes = useMemo(() => zones.reduce((a, z) => a + z.crimeCount, 0), [zones]);
  const highRiskCount = useMemo(() => zones.filter(z => z.riskScore >= 65).length, [zones]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      <p style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>Aggregating Real-time Crime Intelligence...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }}>

      {/* ── Header Stats Bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', flexShrink: 0 }}>
        {[
          { label: 'Active Zones', value: zones.length, color: '#3A86FF', icon: <Layers size={20} /> },
          { label: 'Total Incidents', value: totalCrimes, color: '#FF4D4F', icon: <AlertTriangle size={20} /> },
          { label: 'High Risk Zones', value: highRiskCount, color: '#FFD60A', icon: <Shield size={20} /> },
          { label: 'Live FIRs Synced', value: liveFIRs.length, color: '#2ECC71', icon: <Activity size={20} /> },
        ].map((stat, i) => (
          <div key={i} className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: '700', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: '900', color: stat.color, margin: 0, lineHeight: 1.1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Map + Panel ── */}
      <div style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>

        {/* Zone Intelligence Panel */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '400px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass-panel"
              style={{ height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, border: `2px solid ${getZoneColor(selectedZone)}40` }}
            >
              {/* Panel Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '900', color: getZoneColor(selectedZone), letterSpacing: '2px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} /> ZONE INTELLIGENCE REPORT
                    </div>
                    <h3 style={{ fontWeight: '900', fontSize: '1.2rem', margin: 0, color: 'white' }}>{selectedZone.name}</h3>
                    <p style={{ fontSize: '0.7rem', opacity: 0.6, margin: '4px 0 0' }}>{selectedZone.area}</p>
                  </div>
                  <button onClick={() => setSelectedZone(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Risk Metrics */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { l: 'Risk Score', v: selectedZone.riskScore, c: getSeverityLabel(selectedZone.riskScore).color },
                    { l: 'Incidents', v: selectedZone.crimeCount, c: '#3A86FF' },
                    { l: 'Live FIRs', v: selectedZone.liveFIRs?.length || 0, c: '#2ECC71' },
                  ].map((m, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.55rem', opacity: 0.6, fontWeight: '700', margin: '0 0 4px', textTransform: 'uppercase' }}>{m.l}</p>
                      <p style={{ fontSize: '1.3rem', fontWeight: '900', color: m.c, margin: 0 }}>{m.v}</p>
                    </div>
                  ))}
                </div>

                {/* Severity Badge */}
                {(() => {
                  const sv = getSeverityLabel(selectedZone.riskScore);
                  return (
                    <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: '10px', background: `${sv.color}15`, border: `1px solid ${sv.color}40`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sv.color, boxShadow: `0 0 8px ${sv.color}` }} />
                      <span style={{ fontSize: '0.72rem', fontWeight: '900', color: sv.color }}>THREAT LEVEL: {sv.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Current Crime Type */}
                {zoneIPCSections && (
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>DOMINANT CRIME TYPE</p>
                    <div style={{ padding: '14px', borderRadius: '12px', background: zoneIPCSections.bg, border: `1px solid ${zoneIPCSections.color}40`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{zoneIPCSections.icon}</span>
                      <div>
                        <p style={{ fontWeight: '900', fontSize: '0.9rem', color: zoneIPCSections.color, margin: 0 }}>{selectedZone.dominantCrime}</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.7, margin: 0 }}>Governed under: <strong style={{ color: zoneIPCSections.color }}>{zoneIPCSections.law}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* IPC / Law Sections */}
                {zoneIPCSections && (
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                      APPLICABLE LAWS & SECTIONS
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {zoneIPCSections.sections.map((sec, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${zoneIPCSections.color}25` }}>
                          <span style={{ minWidth: '52px', fontSize: '0.7rem', fontWeight: '900', color: zoneIPCSections.color, fontFamily: 'monospace', flexShrink: 0 }}>
                            Sec {sec.sec}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{sec.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Crime Incidents */}
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                    RECENT INCIDENT INTELLIGENCE
                  </p>
                  {selectedZone.recentCrimes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedZone.recentCrimes.map((crime, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <AlertTriangle size={14} color={getZoneColor(selectedZone)} />
                          <span style={{ fontSize: '0.8rem' }}>{crime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, textAlign: 'center', padding: '16px' }}>No recent incidents on record</p>
                  )}
                </div>

                {/* Live FIRs from DB */}
                {selectedZone.liveFIRs && selectedZone.liveFIRs.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: '900', color: '#2ECC71', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                      ● LIVE DATABASE SYNC — FIR RECORDS
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedZone.liveFIRs.slice(0, 4).map((fir, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)' }}>
                          <p style={{ fontWeight: '800', color: '#3A86FF', fontSize: '0.75rem', margin: '0 0 4px', fontFamily: 'monospace' }}>{fir.fir_id}</p>
                          <p style={{ fontWeight: '700', fontSize: '0.8rem', margin: '0 0 3px' }}>{fir.crime_type}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{fir.description?.substring(0, 80)}...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div style={{ flex: 1, position: 'relative', borderRadius: '20px', overflow: 'hidden', minWidth: 0 }}>

          {/* Map Controls Overlay */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Live Sync Badge */}
            <div className="glass-panel" style={{ padding: '8px 14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71', boxShadow: '0 0 8px #2ECC71' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>LIVE SYNC ACTIVE</span>
              {lastSync && <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>{lastSync.toLocaleTimeString()}</span>}
            </div>

            {/* Crime Type Filter Pills */}
            <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '340px' }}>
              {['All', 'Violent Crime', 'Theft / Robbery', 'Women Safety', 'Drugs', 'Accident', 'Fraud', 'Kidnapping'].map(type => {
                const cls = ipcSectionDB[type];
                const isActive = selectedType === type;
                return (
                  <button key={type} onClick={() => setSelectedType(type)} style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800',
                    background: isActive ? (cls?.color || 'var(--primary-color)') : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? (cls?.color || 'var(--primary-color)') : 'rgba(255,255,255,0.1)'}`,
                    color: 'white', cursor: 'pointer', transition: 'all 0.2s'
                  }}>{type}</button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <button onClick={fetchLiveData} className="glass-panel" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(58,134,255,0.1)', border: '1px solid rgba(58,134,255,0.3)', color: '#3A86FF', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800' }}>
              <RefreshCw size={14} /> REFRESH INTEL
            </button>
          </div>

          {/* Legend Overlay */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 1000 }}>
            <div className="glass-panel" style={{ padding: '14px 16px' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: '900', opacity: 0.6, letterSpacing: '2px', marginBottom: '10px' }}>ZONE LEGEND</p>
              {[
                { label: 'Violent Crime', color: '#FF4D4F' },
                { label: 'Theft / Robbery', color: '#FF6B35' },
                { label: 'Women Safety', color: '#FFD60A' },
                { label: 'Drugs', color: '#A855F7' },
                { label: 'Accident', color: '#FBBF24' },
                { label: 'Fraud', color: '#3A86FF' },
                { label: 'Kidnapping', color: '#92400E' },
                { label: 'Safe Zone', color: '#2ECC71' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="© CARTO" />

            {filteredZones.map(zone => {
              const color = getZoneColor(zone);
              const isSelected = selectedZone?.id === zone.id;
              const opacity = zone.severity === 'safe' ? 0.25 : zone.riskScore >= 75 ? 0.65 : 0.45;
              return (
                <Polygon
                  key={zone.id}
                  positions={getHexagonPoints(zone.lat, zone.lng, zone.radius)}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isSelected ? 0.8 : opacity,
                    color: color,
                    weight: isSelected ? 4 : zone.severity === 'high' ? 2.5 : 1.5,
                    dashArray: zone.severity === 'safe' ? '5,5' : null,
                  }}
                  eventHandlers={{ click: () => setSelectedZone(zone) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'monospace', background: '#0B132B', color: 'white', padding: '8px', borderRadius: '8px', minWidth: '160px' }}>
                      <strong style={{ color }}>{zone.name}</strong><br />
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{zone.dominantCrime} · Risk: {zone.riskScore}</span>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* High-risk pulse circles */}
            {zones.filter(z => z.riskScore >= 75).map(zone => (
              <Circle
                key={`pulse-${zone.id}`}
                center={[zone.lat, zone.lng]}
                radius={zone.radius * 0.3}
                pathOptions={{ fillColor: getZoneColor(zone), fillOpacity: 0.15, color: 'transparent', weight: 0 }}
              />
            ))}
          </MapContainer>
        </div>
      </div>

      <style>{`
        .zone-pulse { animation: hexPulse 2s ease-in-out infinite; }
        @keyframes hexPulse { 0% { fill-opacity: 0.5; } 50% { fill-opacity: 0.15; } 100% { fill-opacity: 0.5; } }
        .leaflet-container { background: #050a1a !important; }
        .leaflet-popup-content-wrapper { background: #0B132B !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; }
        .leaflet-popup-tip { background: #0B132B !important; }
      `}</style>
    </div>
  );
};

export default HotspotMapPage;
