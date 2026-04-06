import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { crimeZones, crimeTypes } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Filter, Layers, Navigation, AlertTriangle, MapPin, XCircle, Clock, FileText, Loader2 } from 'lucide-react';

const getHexagonPoints = (lat, lng, radiusInMeters) => {
  const points = [];
  const radiusInDegrees = radiusInMeters / 111320;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const pLat = lat + radiusInDegrees * Math.cos(angle);
    const pLng = lng + (radiusInDegrees / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
    points.push([pLat, pLng]);
  }
  return points;
};

const HotspotMapPage = () => {
  const [dbRecords, setDbRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedZone, setSelectedZone] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const mapCenter = [13.0418, 80.2341];

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/firs')
      .then(res => res.json())
      .then(data => { setDbRecords(data.data || []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const getZoneColor = (zone) => {
    if (zone.severity === 'safe') return '#2ECC71';
    switch (zone.dominantCrime) {
      case 'Theft': return '#E67E22';
      case 'Women Safety': return '#FFD60A';
      case 'Accident': return '#3498DB';
      default: return zone.severity === 'high' ? '#FF4D4F' : '#95A5A6';
    }
  };

  const zoneFIRs = useMemo(() => {
    if (!selectedZone) return [];
    // Filter database records based on zone name or proximity
    return dbRecords.filter(f => f.location.toLowerCase().includes(selectedZone.name.split(' ')[0].toLowerCase()));
  }, [selectedZone, dbRecords]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      <p style={{ color: 'var(--text-secondary)' }}>Aggregating Real-time Crime Intelligence...</p>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 140px)', position: 'relative', borderRadius: '24px', overflow: 'hidden', display: 'flex' }}>
      <AnimatePresence>
        {selectedZone && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '380px', opacity: 1 }} className="glass-panel" style={{ height: '100%', zIndex: 2000, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{selectedZone.name}</h3><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DATABASE CLOUD SYNC: ACTIVE</p></div>
              <button onClick={() => setSelectedZone(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><XCircle size={24} /></button>
            </div>
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Risk Score (ML)</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800', color: selectedZone.riskScore > 70 ? '#FF4D4F' : '#FFD60A' }}>{selectedZone.riskScore}</p>
                </div>
                <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Active Cases</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: '800' }}>{zoneFIRs.length}</p>
                </div>
              </div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '12px', opacity: 0.6 }}>REAL-TIME ENTRIES</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {zoneFIRs.map(fir => (
                  <div key={fir.id} className="glass-panel" style={{ padding: '16px' }}>
                    <p style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.85rem', marginBottom: '4px' }}>{fir.fir_id}</p>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>{fir.crime_type}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fir.description}</p>
                  </div>
                ))}
                {zoneFIRs.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>No database matches for this sector.</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-panel" style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ECC71' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>DB CONNECTED: SQLITE CLOUD</span>
          </div>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', gap: '12px' }}>
            {['All', 'Theft', 'Women Safety', 'Accident'].map(type => (
              <button key={type} onClick={() => setSelectedType(type)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', background: selectedType === type ? 'var(--primary-color)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>{type}</button>
            ))}
          </div>
        </div>

        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
          {crimeZones.filter(z => selectedType === 'All' || z.dominantCrime === selectedType).map(zone => (
            <Polygon key={zone.id} positions={getHexagonPoints(zone.lat, zone.lng, zone.radius)} pathOptions={{ fillColor: getZoneColor(zone), fillOpacity: 0.5, color: getZoneColor(zone), weight: zone.severity === 'high' ? 3 : 1, className: zone.severity === 'high' ? 'zone-pulse' : '' }} eventHandlers={{ click: () => setSelectedZone(zone) }} />
          ))}
          <Marker position={[13.0425, 80.2348]}><Popup>SOS Unit Active</Popup></Marker>
        </MapContainer>
      </div>

      <style>{`
        .zone-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { fill-opacity: 0.5; } 50% { fill-opacity: 0.2; } 100% { fill-opacity: 0.5; } }
        .leaflet-container { background: #0B132B !important; }
      `}</style>
    </div>
  );
};

export default HotspotMapPage;
