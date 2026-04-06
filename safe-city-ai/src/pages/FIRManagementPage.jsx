import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Download,
  ShieldCheck, Loader2, Lock, Unlock, Upload, Database, AlertTriangle, X, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// === CRIME CLASSIFICATION ENGINE ===
// Maps crime type → law, sections, color, severity
const crimeClassificationDB = {
  'Violent Crime':      { law: 'IPC',      sections: ['302 - Murder', '307 - Attempt to Murder'], color: '#FF4D4F', bg: 'rgba(255,77,79,0.12)',    severity: 'Critical' },
  'Theft / Robbery':   { law: 'IPC',      sections: ['379 - Theft', '380 - Theft by Housebreaking', '392 - Robbery'], color: '#FF6B35', bg: 'rgba(255,107,53,0.12)',  severity: 'High' },
  'Women Safety':      { law: 'IPC',      sections: ['354 - Harassment', '376 - Rape', '498 - Dowry Harassment'], color: '#FFD60A', bg: 'rgba(255,214,10,0.12)',  severity: 'Critical' },
  'Drugs':             { law: 'NDPS Act', sections: ['Sec 20 - Possession', 'Sec 21 - Sale of Drugs', 'Sec 22 - Transport'], color: '#A855F7', bg: 'rgba(168,85,247,0.12)', severity: 'High' },
  'Weapons':           { law: 'Arms Act', sections: ['Sec 25 - Illegal Weapon Possession'], color: '#374151', bg: 'rgba(55,65,81,0.3)',    severity: 'High' },
  'Fraud':             { law: 'IPC',      sections: ['420 - Cheating & Fraud'], color: '#3A86FF', bg: 'rgba(58,134,255,0.12)',  severity: 'Medium' },
  'Public Disturbance':{ law: 'IPC',      sections: ['144 - Unlawful Assembly'], color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', severity: 'Low' },
  'Kidnapping':        { law: 'IPC',      sections: ['363 - Kidnapping'], color: '#92400E', bg: 'rgba(146,64,14,0.2)',    severity: 'Critical' },
  'Assault':           { law: 'IPC',      sections: ['351 - Assault / Hurt'], color: '#F97316', bg: 'rgba(249,115,22,0.12)',  severity: 'High' },
  'Threat / Extortion':{ law: 'IPC',      sections: ['506 - Criminal Intimidation'], color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  severity: 'Medium' },
  'Corruption':        { law: 'IPC',      sections: ['161 - Bribery / Corruption'], color: '#34D399', bg: 'rgba(52,211,153,0.12)',  severity: 'Medium' },
  'Accident':          { law: 'IPC',      sections: ['279 - Rash Driving / Motor Accident'], color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  severity: 'Medium' },
};

const specificCrimeTypes = Object.keys(crimeClassificationDB);

// NLP Keyword → Crime Type auto-classifier
const nlpKeywords = {
  'murder': 'Violent Crime', 'kill': 'Violent Crime', 'shot': 'Violent Crime', 'stabbed': 'Violent Crime', 'attack': 'Violent Crime',
  'theft': 'Theft / Robbery', 'stolen': 'Theft / Robbery', 'robbery': 'Theft / Robbery', 'chain snatch': 'Theft / Robbery', 'pickpocket': 'Theft / Robbery',
  'harass': 'Women Safety', 'rape': 'Women Safety', 'molest': 'Women Safety', 'stalking': 'Women Safety', 'dowry': 'Women Safety', 'eve-teasing': 'Women Safety',
  'drugs': 'Drugs', 'narcotic': 'Drugs', 'weed': 'Drugs', 'cocaine': 'Drugs', 'substance': 'Drugs',
  'weapon': 'Weapons', 'gun': 'Weapons', 'pistol': 'Weapons', 'illegal arm': 'Weapons', 'knife': 'Weapons',
  'fraud': 'Fraud', 'cheat': 'Fraud', 'scam': 'Fraud', 'fake': 'Fraud', 'forgery': 'Fraud',
  'riot': 'Public Disturbance', 'assembly': 'Public Disturbance', 'protest': 'Public Disturbance', 'disturb': 'Public Disturbance',
  'kidnap': 'Kidnapping', 'abduct': 'Kidnapping', 'missing': 'Kidnapping',
  'assault': 'Assault', 'beat': 'Assault', 'hit': 'Assault', 'hurt': 'Assault', 'punch': 'Assault',
  'threat': 'Threat / Extortion', 'extort': 'Threat / Extortion', 'blackmail': 'Threat / Extortion', 'intimidat': 'Threat / Extortion',
  'bribe': 'Corruption', 'corrupt': 'Corruption', 'kickback': 'Corruption',
  'accident': 'Accident', 'crash': 'Accident', 'collision': 'Accident', 'rash driving': 'Accident',
};


const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return position.lat ? <Marker position={[position.lat, position.lng]}><Popup>Incident Location</Popup></Marker> : null;
};

const FIRManagementPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [newFIR, setNewFIR] = useState({
    FIR_ID: null, Crime_Type: 'Theft / Robbery', IPC_Section: '', Latitude: 13.0418,
    Longitude: 80.2341, Date_Time: '', Description: '', Police_Station: 'Central Station', Statement_File: null
  });
  const [selectedFIR, setSelectedFIR] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8888/api/firs');
      const data = await response.json();
      const mappedData = (data.data || []).map(r => ({
        FIR_ID: r.fir_id,
        Crime_Type: r.crime_type,
        IPC_Section: r.ipc_section || r.sections || 'Pending',
        Latitude: r.lat || 13.0418,
        Longitude: r.lng || 80.2341,
        Date_Time: r.date_time || r.timestamp,
        Description: r.description,
        Police_Station: r.police_station || r.branch_name || 'Central HQ',
        integrity_hash: r.integrity_hash,
        status: r.status,
        officer: r.officer_name
      }));
      setRecords(mappedData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch FIRs:", err);
      setLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    const lc = text.toLowerCase();
    let detectedType = newFIR.Crime_Type;
    for (const [keyword, crimeType] of Object.entries(nlpKeywords)) {
      if (lc.includes(keyword)) {
        detectedType = crimeType;
        break;
      }
    }
    const classification = crimeClassificationDB[detectedType];
    const autoSection = classification ? `${classification.law}: ${classification.sections.join(', ')}` : '';
    setNewFIR({ ...newFIR, Description: text, Crime_Type: detectedType, IPC_Section: autoSection });
  };

  const handleCrimeTypeChange = (crimeType) => {
    const classification = crimeClassificationDB[crimeType];
    const autoSection = classification ? `${classification.law}: ${classification.sections.join(', ')}` : '';
    setNewFIR({ ...newFIR, Crime_Type: crimeType, IPC_Section: autoSection });
  };

  const handleLocationChange = (pos) => {
    setNewFIR(prev => ({ ...prev, Latitude: pos.lat, Longitude: pos.lng }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewFIR({ ...newFIR, Statement_File: e.target.files[0] });
    }
  };

  const currentDateTimeStr = () => new Date().toISOString();

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${day} ${month} ${year} • ${time}`;
    } catch (e) {
      return isoString;
    }
  };

  const handleSaveFIR = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalDateTime = newFIR.Date_Time || currentDateTimeStr();
    const finalFIRID = newFIR.FIR_ID || `0x${Math.floor(Math.random() * 1000000000).toString(16)}`;
    const formData = new FormData();
    formData.append('FIR_ID', finalFIRID);
    formData.append('Crime_Type', newFIR.Crime_Type);
    formData.append('IPC_Section', newFIR.IPC_Section || 'Pending AI Class');
    formData.append('Latitude', newFIR.Latitude);
    formData.append('Longitude', newFIR.Longitude);
    formData.append('Date_Time', finalDateTime);
    formData.append('Description', newFIR.Description);
    formData.append('Police_Station', newFIR.Police_Station);
    if (newFIR.Statement_File) formData.append('Statement_File', newFIR.Statement_File);
    try {
      const optimisticRecord = {
        FIR_ID: finalFIRID, Crime_Type: newFIR.Crime_Type,
        IPC_Section: newFIR.IPC_Section || 'Pending AI Class',
        Latitude: newFIR.Latitude, Longitude: newFIR.Longitude,
        Date_Time: finalDateTime, Description: newFIR.Description,
        Police_Station: newFIR.Police_Station, status: 'Open', officer: 'Officer Main'
      };
      setRecords(prev => [optimisticRecord, ...prev]);
      setShowModal(false);
      setIsEditing(false);
      const response = await fetch('http://127.0.0.1:8888/api/firs', { method: 'POST', body: formData });
      resetForm();
      if (response.ok) fetchRecords();
    } catch (err) {
      console.error("Failed to save FIR:", err);
      setShowModal(false);
      setIsEditing(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewFIR({ FIR_ID: null, Crime_Type: 'IPC', IPC_Section: '', Latitude: 13.0418, Longitude: 80.2341, Date_Time: '', Description: '', Police_Station: 'Central Station', Statement_File: null });
  };

  const openAppModal = (fir = null) => {
    if (fir) {
      setIsEditing(true);
      setNewFIR({ FIR_ID: fir.FIR_ID, Crime_Type: fir.Crime_Type, IPC_Section: fir.IPC_Section, Latitude: fir.Latitude || 13.0418, Longitude: fir.Longitude || 80.2341, Date_Time: fir.Date_Time, Description: fir.Description, Police_Station: fir.Police_Station, Statement_File: null });
    } else {
      setIsEditing(false);
      resetForm();
      setNewFIR(prev => ({ ...prev, Date_Time: currentDateTimeStr() }));
    }
    setShowModal(true);
  };

  const handleSelectFIR = (fir) => {
    setSelectedFIR(fir);
    setIsDecrypted(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(fir => {
      const matchSearch = !searchTerm || fir.FIR_ID?.toLowerCase().includes(searchTerm.toLowerCase()) || fir.Police_Station?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'All' || fir.Crime_Type === selectedType;
      return matchSearch && matchType;
    });
  }, [records, searchTerm, selectedType]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderEncrypted = (value) => {
    if (!value) return <span style={{ opacity: 0.3 }}>N/A</span>;
    if (isDecrypted) return value;
    return (
      <span style={{ background: 'rgba(255,77,79,0.15)', color: '#FF4D4F', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Lock size={10} /> CONFIDENTIAL
      </span>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%' }}>

      {/* Main Registry Panel */}
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>FIR Intelligence & Registry</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tamper-Proof Ledger Data Processing</p>
          </div>
          <button onClick={() => openAppModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
            <Plus size={18} /> Register Incident
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ flex: 1, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search by FIR_ID or Station..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '10px 0', outline: 'none' }} />
          </div>
          <select className="glass-panel" style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'white', outline: 'none', border: '1px solid var(--border-color)' }} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="All">All Categories</option>
            {specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 180px 220px 100px', gap: '16px', padding: '0 24px 8px', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <div>FIR_ID</div>
          <div>Crime_Type</div>
          <div>Police_Station</div>
          <div>Date_Time</div>
          <div>STATUS</div>
        </div>

        {/* Table Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {loading && <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>Loading records...</div>}
          {!loading && currentRecords.map((fir) => (
            <motion.div
              key={fir.FIR_ID}
              onClick={() => handleSelectFIR(fir)}
              whileHover={{ x: 4, background: 'rgba(255,255,255,0.03)' }}
              style={{
                padding: '16px 24px', borderRadius: '16px',
                background: selectedFIR?.FIR_ID === fir.FIR_ID ? 'rgba(58, 134, 255, 0.08)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${selectedFIR?.FIR_ID === fir.FIR_ID ? 'rgba(58, 134, 255, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                cursor: 'pointer', display: 'grid',
                gridTemplateColumns: '150px 1fr 180px 220px 100px',
                gap: '16px', alignItems: 'center', transition: 'all 0.3s'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-color)' }}>{fir.FIR_ID?.substring(0, 14) || 'PENDING...'}</div>
              <div>
                {(() => {
                  const cls = crimeClassificationDB[fir.Crime_Type];
                  const color = cls?.color || '#3A86FF';
                  const bg = cls?.bg || 'rgba(58,134,255,0.1)';
                  return (
                    <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', background: bg, color: color, fontWeight: '800', border: `1px solid ${color}30` }}>
                      {fir.Crime_Type}
                    </span>
                  );
                })()}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{fir.Police_Station}</div>
              <div style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.7)' }}>{formatDate(fir.Date_Time)}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: fir.status === 'Open' ? '#FFD60A' : '#2ECC71' }}>{fir.status}</div>
            </motion.div>
          ))}
          {!loading && currentRecords.length === 0 && <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>No records found.</div>}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: currentPage === i + 1 ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== CENTERED DOSSIER MODAL ===== */}
      <AnimatePresence>
        {selectedFIR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedFIR(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '980px', padding: '40px', maxHeight: '90vh', overflowY: 'auto', border: '2px solid rgba(58, 134, 255, 0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', background: 'linear-gradient(135deg, rgba(8, 14, 35, 0.99), rgba(20, 30, 60, 0.99))', display: 'flex', flexDirection: 'column', gap: '28px' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD60A', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '3px', marginBottom: '6px' }}>
                    <ShieldCheck size={16} /> STRATEGIC INTELLIGENCE DOSSIER
                  </div>
                  <h3 style={{ fontWeight: '900', fontSize: '1.6rem', color: 'white', letterSpacing: '-0.5px', margin: 0 }}>OFFICIAL CASE RECORD</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button title="Download" style={{ padding: '10px', color: 'white', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex' }}>
                    <Download size={20} />
                  </button>
                  <button onClick={() => setSelectedFIR(null)} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', borderRadius: '12px', display: 'flex' }}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body: two-column layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px' }}>

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Decrypt Control */}
                  <div style={{ padding: '20px', borderRadius: '16px', background: isDecrypted ? 'rgba(46,204,113,0.08)' : 'rgba(255,77,79,0.08)', border: `1px solid ${isDecrypted ? 'rgba(46,204,113,0.3)' : 'rgba(255,77,79,0.3)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: isDecrypted ? '#2ECC71' : '#FF4D4F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        {isDecrypted ? <Unlock size={22} /> : <Lock size={22} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: '900', color: isDecrypted ? '#2ECC71' : '#FF4D4F', margin: '0 0 2px' }}>{isDecrypted ? 'SECURE DATA DECRYPTED' : 'LEDGER ACCESS RESTRICTED'}</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.65, margin: 0 }}>{isDecrypted ? 'Access is being audit-logged in the system.' : 'Authentication required to view sensitive data.'}</p>
                      </div>
                      <button onClick={() => setIsDecrypted(!isDecrypted)} style={{ padding: '8px 18px', borderRadius: '10px', background: isDecrypted ? 'rgba(255,255,255,0.05)' : '#FF4D4F', border: isDecrypted ? '1px solid #2ECC71' : 'none', color: 'white', fontSize: '0.78rem', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {isDecrypted ? 'LOCK' : 'REVEAL'}
                      </button>
                    </div>
                  </div>

                  {/* Section A */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)', borderBottom: '1px solid rgba(58,134,255,0.2)', paddingBottom: '8px', marginBottom: '12px' }}>SECTION A — CASE IDENTIFICATION</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)' }}>
                        <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '6px' }}>LEDGER RECORD ID</p>
                        <p style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white', wordBreak: 'break-all', margin: 0 }}>{selectedFIR.FIR_ID}</p>
                        {selectedFIR.integrity_hash && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.55rem', color: '#2ECC71', fontWeight: '700', fontFamily: 'monospace' }}>
                            SHA256: {selectedFIR.integrity_hash.substring(0, 28)}...
                          </div>
                        )}
                      </div>
                      <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.3)' }}>
                        <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '6px' }}>CRIME TYPE</p>
                        {(() => {
                          const cls = crimeClassificationDB[selectedFIR.Crime_Type];
                          const color = cls?.color || '#3A86FF';
                          const bg = cls?.bg || 'rgba(58,134,255,0.1)';
                          return (
                            <div>
                              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '8px', background: bg, color: color, fontWeight: '900', fontSize: '0.85rem', border: `1px solid ${color}40` }}>
                                {selectedFIR.Crime_Type?.toUpperCase()}
                              </span>
                              {cls && <div style={{ marginTop: '6px', fontSize: '0.6rem', opacity: 0.6 }}>Severity: <strong style={{ color }}>{cls.severity}</strong></div>}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(0,0,0,0.3)', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '4px' }}>LEGAL FRAMEWORK</p>
                          {(() => {
                            const cls = crimeClassificationDB[selectedFIR.Crime_Type];
                            return cls
                              ? <span style={{ fontSize: '0.8rem', fontWeight: '900', color: cls.color, padding: '2px 10px', background: cls.bg, borderRadius: '6px' }}>{cls.law}</span>
                              : <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{renderEncrypted(selectedFIR.IPC_Section)}</span>;
                          })()}
                        </div>
                        <div style={{ opacity: 0.1 }}><ShieldCheck size={36} /></div>
                      </div>
                      {(() => {
                        const cls = crimeClassificationDB[selectedFIR.Crime_Type];
                        if (!cls || !isDecrypted) return renderEncrypted('sections');
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {cls.sections.map((sec, i) => (
                              <span key={i} style={{ fontSize: '0.68rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${cls.color}50`, color: cls.color, fontWeight: '700' }}>
                                Sec {sec}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Section C */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)', borderBottom: '1px solid rgba(58,134,255,0.2)', paddingBottom: '8px', marginBottom: '12px' }}>SECTION C — INCIDENT NARRATIVE</div>
                    <div className="glass-panel" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', minHeight: '120px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '10px' }}>OFFICIAL DESCRIPTION</p>
                      <div style={{ fontSize: '0.88rem', lineHeight: '1.75', color: 'rgba(255,255,255,0.92)' }}>
                        {renderEncrypted(selectedFIR.Description)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Section B: Map */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary-color)', borderBottom: '1px solid rgba(58,134,255,0.2)', paddingBottom: '8px', marginBottom: '12px' }}>SECTION B — GEOSPATIAL LOGISTICS</div>
                    <div style={{ height: '220px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', filter: isDecrypted ? 'none' : 'blur(18px)', transition: 'filter 0.5s ease' }}>
                      <MapContainer center={[selectedFIR.Latitude || 13.0418, selectedFIR.Longitude || 80.2341]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        {selectedFIR.Latitude && selectedFIR.Longitude && <Marker position={[selectedFIR.Latitude, selectedFIR.Longitude]} />}
                      </MapContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <div className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.3)' }}>
                        <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '4px' }}>GPS COORDINATES</p>
                        <p style={{ fontWeight: '800', fontSize: '0.8rem', margin: 0 }}>{renderEncrypted(`${Number(selectedFIR.Latitude).toFixed(5)}, ${Number(selectedFIR.Longitude).toFixed(5)}`)}</p>
                      </div>
                      <div className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.3)' }}>
                        <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '4px' }}>UNIT ASSIGNMENT</p>
                        <p style={{ fontWeight: '800', fontSize: '0.8rem', color: '#FFD60A', margin: 0 }}>{renderEncrypted(selectedFIR.Police_Station)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Officer / Timestamp */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.3)' }}>
                      <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '4px' }}>OFFICER SIGNATURE</p>
                      <p style={{ fontWeight: '800', fontSize: '0.82rem', margin: 0 }}>{renderEncrypted(selectedFIR.officer || 'Officer Main')}</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '14px', background: 'rgba(0,0,0,0.3)' }}>
                      <p style={{ opacity: 0.5, fontSize: '0.6rem', marginBottom: '4px' }}>LEDGER TIMESTAMP</p>
                      <p style={{ fontWeight: '800', fontSize: '0.76rem', margin: 0 }}>{renderEncrypted(formatDate(selectedFIR.Date_Time))}</p>
                    </div>
                  </div>

                  {/* Section D: Evidence */}
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#FFD60A', borderBottom: '1px solid rgba(255,214,10,0.2)', paddingBottom: '8px', marginBottom: '12px' }}>SECTION D — EVIDENCE VAULT</div>
                    <div className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,214,10,0.04)', border: '1px solid rgba(255,214,10,0.15)' }}>
                      <div style={{ padding: '12px', background: 'rgba(255,214,10,0.15)', borderRadius: '12px', color: '#FFD60A', flexShrink: 0 }}>
                        <Upload size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: '900', margin: '0 0 2px' }}>WRITTEN STATEMENT</p>
                        <p style={{ fontSize: '0.65rem', opacity: 0.65, margin: 0 }}>Secure PDF Attachment (Verified)</p>
                      </div>
                      <button onClick={() => alert('Decrypting asset from secure government vault...')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer' }}>
                        ACCESS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', paddingTop: '8px' }}>
                <button onClick={() => { setSelectedFIR(null); openAppModal(selectedFIR); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(58,134,255,0.15)', border: '1px solid rgba(58,134,255,0.4)', color: '#3A86FF', fontSize: '0.88rem', fontWeight: '900', cursor: 'pointer' }}>
                  AMEND RECORD INTELLIGENCE
                </button>
                <button onClick={() => setSelectedFIR(null)} style={{ flex: 0.45, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', fontWeight: '800', cursor: 'pointer' }}>
                  CLOSE DOSSIER
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== REGISTER / EDIT FIR MODAL ===== */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '40px', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={24} /></button>
              <h2 style={{ marginBottom: '8px', fontWeight: '800' }}>{isEditing ? 'Amend Incident Record' : 'Register Secure FIR'}</h2>
              <p style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fields align strictly with standardized database schema</p>

              <form onSubmit={handleSaveFIR} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>FIR_ID</label>
                    <input disabled style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', color: 'gray', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} value={newFIR.FIR_ID || 'System Auto-Generated (Hash)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>Date_Time</label>
                    <input disabled style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.4)', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} value={formatDate(newFIR.Date_Time)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>Police_Station</label>
                    <input required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} value={newFIR.Police_Station} onChange={e => setNewFIR({ ...newFIR, Police_Station: e.target.value })} placeholder="E.g., Anna Nagar Sector 4" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>Crime_Type</label>
                    <select style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px', border: `1px solid ${crimeClassificationDB[newFIR.Crime_Type]?.color || 'var(--border-color)'}40`, outline: 'none', boxSizing: 'border-box' }} value={newFIR.Crime_Type} onChange={e => handleCrimeTypeChange(e.target.value)}>
                      {specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {newFIR.Crime_Type && crimeClassificationDB[newFIR.Crime_Type] && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: crimeClassificationDB[newFIR.Crime_Type].bg, color: crimeClassificationDB[newFIR.Crime_Type].color, fontWeight: '900' }}>
                          {crimeClassificationDB[newFIR.Crime_Type].law}
                        </span>
                        <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>Severity: <strong style={{ color: crimeClassificationDB[newFIR.Crime_Type].color }}>{crimeClassificationDB[newFIR.Crime_Type].severity}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>Description</label>
                  <textarea rows="3" required style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px', resize: 'none', border: '1px solid var(--border-color)', outline: 'none', boxSizing: 'border-box' }} value={newFIR.Description} onChange={handleDescriptionChange} placeholder="Enter detailed description..." />
                  {newFIR.IPC_Section && (() => {
                    const cls = crimeClassificationDB[newFIR.Crime_Type];
                    return (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '10px', padding: '12px 14px', background: cls ? cls.bg : 'rgba(58,134,255,0.08)', borderRadius: '10px', border: `1px solid ${cls?.color || '#3A86FF'}30` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <AlertTriangle size={14} color={cls?.color || '#3A86FF'} />
                          <span style={{ fontSize: '0.72rem', fontWeight: '900', color: cls?.color || '#3A86FF' }}>AUTO-CLASSIFIED: {cls?.law || 'IPC'}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {cls?.sections.map((sec, i) => (
                            <span key={i} style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: '20px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${cls.color}50`, color: cls.color, fontWeight: '700' }}>
                              Sec {sec}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Geospatial Data (Latitude / Longitude)</span>
                    <span style={{ color: 'var(--primary-color)' }}>{newFIR.Latitude.toFixed(4)}, {newFIR.Longitude.toFixed(4)}</span>
                  </label>
                  <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <MapContainer center={[newFIR.Latitude, newFIR.Longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <LocationPicker position={{ lat: newFIR.Latitude, lng: newFIR.Longitude }} setPosition={handleLocationChange} />
                    </MapContainer>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', opacity: 0.7, marginBottom: '6px', display: 'block' }}>Statement Upload</label>
                  <div style={{ position: 'relative', width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Upload size={20} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.85rem', color: newFIR.Statement_File ? 'white' : 'var(--text-secondary)', flex: 1 }}>
                      {newFIR.Statement_File ? newFIR.Statement_File.name : 'Choose a file (PDF, Image)'}
                    </span>
                    <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} style={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }} />
                    {newFIR.Statement_File && <ShieldCheck size={20} color="#2ECC71" />}
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                  {isSubmitting ? 'Committing Encrypted Data...' : (isEditing ? 'Amend Ledger Record' : 'Commit to Database')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FIRManagementPage;
