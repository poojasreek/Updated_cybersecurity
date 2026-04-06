import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, Navigation, Phone, Clock, MapPin, ArrowRight, Loader, CheckCircle } from 'lucide-react';

// Chennai police stations data
const POLICE_STATIONS = [
  { id: 1, name: 'T. Nagar Police Station',       lat: 13.0412, lng: 80.2310, phone: '044-28151000', type: 'Full Station', officers: 42 },
  { id: 2, name: 'Nungambakkam Police Station',    lat: 13.0569, lng: 80.2397, phone: '044-28237000', type: 'Full Station', officers: 38 },
  { id: 3, name: 'Anna Nagar Police Station',      lat: 13.0855, lng: 80.2095, phone: '044-26221000', type: 'Full Station', officers: 35 },
  { id: 4, name: 'Guindy Police Station',          lat: 13.0080, lng: 80.2190, phone: '044-22501000', type: 'Full Station', officers: 30 },
  { id: 5, name: 'Adyar Police Station',           lat: 13.0060, lng: 80.2560, phone: '044-24412000', type: 'Full Station', officers: 28 },
  { id: 6, name: 'Mylapore Police Station',        lat: 13.0368, lng: 80.2676, phone: '044-24938000', type: 'Full Station', officers: 32 },
  { id: 7, name: 'Royapuram Police Station',       lat: 13.1135, lng: 80.2965, phone: '044-25951000', type: 'Full Station', officers: 26 },
  { id: 8, name: 'Velachery Police Station',       lat: 12.9815, lng: 80.2180, phone: '044-22540000', type: 'Full Station', officers: 29 },
];

// Haversine distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Waypoint route — adds a mid-point detour to simulate a realistic road path
function buildRoute(from, to) {
  const midLat = (from[0] + to[0]) / 2 + ((Math.random() - 0.5) * 0.01);
  const midLng = (from[1] + to[1]) / 2 + ((Math.random() - 0.5) * 0.01);
  return [from, [midLat, midLng], to];
}

// Auto-fit map bounds to route
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length > 1) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions]);
  return null;
}

const userIcon = new L.DivIcon({ className: '', html: '<div style="width:18px;height:18px;background:#2ECC71;border-radius:50%;border:3px solid white;box-shadow:0 0 14px rgba(46,204,113,0.8)"></div>' });
const stationIcon = new L.DivIcon({ className: '', html: '<div style="width:15px;height:15px;background:#3A86FF;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(58,134,255,0.6)"></div>' });
const selectedStationIcon = new L.DivIcon({ className: '', html: '<div style="width:18px;height:18px;background:#FFD60A;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(255,214,10,0.8)"></div>' });

export default function NearbyStationsPage() {
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [stationsWithDist, setStationsWithDist] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [eta, setEta] = useState(null);
  const routeRef = useRef(null);

  // Get real GPS on mount
  useEffect(() => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocating(false);
        computeDistances(loc);
      },
      () => {
        // Fallback: default to T. Nagar, Chennai for demo
        const fallback = { lat: 13.0418, lng: 80.2341, isFallback: true };
        setUserLocation(fallback);
        setLocating(false);
        computeDistances(fallback);
      },
      { timeout: 7000 }
    );
  }, []);

  const computeDistances = (loc) => {
    const withDist = POLICE_STATIONS.map(s => ({
      ...s,
      distance: getDistance(loc.lat, loc.lng, s.lat, s.lng),
    })).sort((a, b) => a.distance - b.distance);
    setStationsWithDist(withDist);
    setSelected(withDist[0]); // auto-select nearest
  };

  const handleGetDirections = (station) => {
    setSelected(station);
    const from = [userLocation.lat, userLocation.lng];
    const to = [station.lat, station.lng];
    const path = buildRoute(from, to);
    setRoutePath(path);
    setShowRoute(true);
    // Estimate ETA: average walking speed 5 km/h, driving 30 km/h
    const walkMins = Math.ceil((station.distance / 5) * 60);
    const driveMins = Math.ceil((station.distance / 30) * 60);
    setEta({ walk: walkMins, drive: driveMins });
  };

  const openGoogleMaps = (station) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.lat},${station.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const mapCenter = selected
    ? [(userLocation?.lat + selected.lat) / 2, (userLocation?.lng + selected.lng) / 2]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : [13.0418, 80.2341];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 4px' }}>🚓 Nearby Police Stations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
          {locating ? 'Detecting your location...' : userLocation?.isFallback
            ? '⚠ Using demo location (T. Nagar, Chennai). Allow GPS for real location.'
            : `📍 Using your real GPS location · ${stationsWithDist.length} stations found`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
        {/* MAP */}
        <div style={{ flex: '1', minWidth: '380px', borderRadius: '16px', overflow: 'hidden', height: '520px', border: '1px solid var(--border-color)' }}>
          {locating ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', background: 'rgba(0,0,0,0.2)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
                <Loader size={32} color="#3A86FF" />
              </motion.div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Locating you...</p>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              {/* User location */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                  <Popup>📍 Your Location</Popup>
                </Marker>
              )}

              {/* All police stations */}
              {stationsWithDist.map(s => (
                <Marker
                  key={s.id}
                  position={[s.lat, s.lng]}
                  icon={selected?.id === s.id ? selectedStationIcon : stationIcon}
                  eventHandlers={{ click: () => handleGetDirections(s) }}
                >
                  <Popup>
                    <strong>🚓 {s.name}</strong><br />
                    📞 {s.phone}<br />
                    📏 {s.distance.toFixed(2)} km away
                  </Popup>
                </Marker>
              ))}

              {/* Route line */}
              {showRoute && routePath && (
                <>
                  <Polyline positions={routePath} pathOptions={{ color: '#2ECC71', weight: 4, opacity: 0.9 }} />
                  <FitBounds positions={routePath} />
                </>
              )}
            </MapContainer>
          )}
        </div>

        {/* STATION LIST + DIRECTIONS */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '520px', overflowY: 'auto' }}>
          {/* ETA card */}
          <AnimatePresence>
            {showRoute && eta && selected && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.35)', borderRadius: '14px', padding: '14px 16px' }}>
                <p style={{ fontWeight: '800', color: '#2ECC71', margin: '0 0 10px', fontSize: '0.9rem' }}>
                  🗺 Route to {selected.name}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#2ECC71' }}>{eta.drive} min</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🚗 Driving</p>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#3A86FF' }}>{eta.walk} min</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>🚶 Walking</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => openGoogleMaps(selected)}
                    style={{ flex: 1, background: '#2ECC71', color: 'white', border: 'none', borderRadius: '8px', padding: '9px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Navigation size={13} /> Open in Maps
                  </button>
                  <button onClick={() => setShowRoute(false)}
                    style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Clear
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Station cards */}
          {stationsWithDist.map((s, i) => {
            const isNearest = i === 0;
            const isSelected = selected?.id === s.id;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: isSelected ? 'rgba(58,134,255,0.12)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isSelected ? 'rgba(58,134,255,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => handleGetDirections(s)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isSelected ? '#3A86FF' : 'rgba(58,134,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Shield size={16} color={isSelected ? 'white' : '#3A86FF'} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '800', fontSize: '0.83rem', lineHeight: 1.3 }}>{s.name}</p>
                      {isNearest && (
                        <span style={{ fontSize: '0.62rem', background: 'rgba(46,204,113,0.15)', color: '#2ECC71', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                          NEAREST
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: isNearest ? '#2ECC71' : '#FFD60A', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {s.distance.toFixed(2)} km
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={10} /> {s.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Shield size={10} /> {s.officers} officers on duty</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={10} /> ~{Math.ceil((s.distance / 30) * 60)} min drive</span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleGetDirections(s); }}
                  style={{ width: '100%', background: isSelected ? '#3A86FF' : 'rgba(58,134,255,0.12)', color: isSelected ? 'white' : '#3A86FF', border: `1px solid ${isSelected ? '#3A86FF' : 'rgba(58,134,255,0.3)'}`, borderRadius: '8px', padding: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                >
                  <Navigation size={13} />
                  {isSelected && showRoute ? 'Route Shown on Map' : 'Get Directions'}
                  {!(isSelected && showRoute) && <ArrowRight size={12} />}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
