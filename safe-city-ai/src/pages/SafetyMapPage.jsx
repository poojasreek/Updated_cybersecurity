import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import { crimeZones } from '../data/mockData';

// Safe route: avoids high-risk zones, goes through safe areas
const SAFE_ROUTE = [
  [13.0418, 80.2341],
  [13.0480, 80.2380],
  [13.0520, 80.2420],
  [13.0560, 80.2430],
  [13.0600, 80.2440],
  [13.0620, 80.2410],
  [13.0650, 80.2390],
  [13.0700, 80.2350],
];

const DIRECT_ROUTE = [
  [13.0418, 80.2341],
  [13.0600, 80.2600],
  [13.0700, 80.2800],
];

const userIcon = new L.DivIcon({ className: '', html: '<div style="width:18px;height:18px;background:#2ECC71;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(46,204,113,0.8)"></div>' });

const riskColor   = { high: '#FF4D4F', medium: '#FFD60A', safe: '#2ECC71', low: '#00B4D8' };
const riskOpacity = { high: 0.25, medium: 0.18, safe: 0.12, low: 0.15 };

export default function SafetyMapPage() {
  const [showSafeRoute, setShowSafeRoute] = useState(false);
  const userLocation = [13.0418, 80.2341];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>🗺️ Safety Map</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Crime zones · Safer routes based on FIR data</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Map */}
        <div style={{ flex: '1', minWidth: '400px', borderRadius: '16px', overflow: 'hidden', height: '520px', border: '1px solid var(--border-color)' }}>
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

            {/* User location */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>📍 Your Location</Popup>
            </Marker>

            {/* Crime zones */}
            {crimeZones.map(zone => (
              <Circle key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{ color: riskColor[zone.severity] || '#999', fillColor: riskColor[zone.severity] || '#999', fillOpacity: riskOpacity[zone.severity] || 0.1, weight: 1.5 }}>
                <Popup>
                  <div>
                    <strong>{zone.name}</strong><br />
                    ⚠️ Risk: <strong>{zone.severity.toUpperCase()}</strong><br />
                    Crime: {zone.dominantCrime}<br />
                    Recent: {zone.recentCrimes.slice(0, 2).join(', ')}
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Routes */}
            {showSafeRoute && (
              <Polyline positions={DIRECT_ROUTE} pathOptions={{ color: '#FF4D4F', weight: 3, dashArray: '8 8', opacity: 0.7 }} />
            )}
            {showSafeRoute && (
              <Polyline positions={SAFE_ROUTE} pathOptions={{ color: '#2ECC71', weight: 4, opacity: 0.9 }} />
            )}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Legend */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: '800' }}>Map Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {[
                { color: '#FF4D4F', label: 'High Risk Zone' },
                { color: '#FFD60A', label: 'Medium Risk Zone' },
                { color: '#2ECC71', label: 'Safe Zone' },
                { color: '#00B4D8', label: 'Low Risk Zone' },
                { color: '#2ECC71', label: 'Safe Route', thick: true },
                { color: '#FF4D4F', label: 'Unsafe Route', thick: true, dashed: true },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  {item.thick ? (
                    <div style={{ width: '28px', height: '4px', borderRadius: '2px', background: item.dashed ? 'transparent' : item.color, backgroundImage: item.dashed ? `repeating-linear-gradient(90deg, ${item.color} 0px, ${item.color} 6px, transparent 6px, transparent 12px)` : 'none', border: item.dashed ? 'none' : 'none' }} />
                  ) : (
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color, opacity: 0.8 }} />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Route toggle */}
          <div className="glass-panel" style={{ padding: '18px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: '800' }}>
              <Navigation size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Safer Route
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.6 }}>
              Generates a route that avoids high-crime zones based on current FIR data.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowSafeRoute(v => !v)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', background: showSafeRoute ? 'rgba(46,204,113,0.15)' : 'linear-gradient(135deg, #2ECC71, #1a8a4a)', color: showSafeRoute ? '#2ECC71' : 'white', border: showSafeRoute ? '1px solid #2ECC71' : 'none' }}>
              {showSafeRoute ? '✓ Route Shown on Map' : '🗺️ Show Safer Route'}
            </motion.button>
            {showSafeRoute && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '12px', fontSize: '0.77rem', lineHeight: 1.7 }}>
                <p style={{ color: '#2ECC71', margin: '0 0 4px', fontWeight: '700' }}>✅ Safe Route:</p>
                <p style={{ margin: 0 }}>T. Nagar → Nungambakkam → Destination</p>
                <p style={{ color: '#FF4D4F', margin: '8px 0 4px', fontWeight: '700' }}>❌ Avoid (High Risk):</p>
                <p style={{ margin: 0 }}>Direct route via Mylapore & Royapuram</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
