import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../context/AuthContext';
import { useSOS } from '../context/SOSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Navigation, ArrowRight } from 'lucide-react';

const SOSToastOverlay = () => {
  const { toast, dismissToast } = useSOS();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show to police/admin
  if (!toast || user?.role === 'citizen') return null;

  const handleView = () => {
    navigate('/alerts');
    dismissToast();
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
            width: '340px', background: 'rgba(15,15,20,0.96)',
            border: '2px solid #FF4D4F',
            borderRadius: '16px', padding: '18px 20px',
            boxShadow: '0 0 40px rgba(255,77,79,0.35)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Close button */}
          <button onClick={dismissToast} style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
            <X size={16} />
          </button>

          {/* Pulsing badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,77,79,0.15)', border: '1px solid #FF4D4F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <AlertTriangle size={20} color="#FF4D4F" />
            </motion.div>
            <div>
              <p style={{ margin: 0, fontWeight: '900', color: '#FF4D4F', fontSize: '0.9rem' }}>🆘 SOS EMERGENCY</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>Citizen needs immediate help</p>
            </div>
          </div>

          {/* Citizen details */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#aaa' }}>Citizen</span>
              <strong style={{ color: 'white' }}>{toast.citizenName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#aaa' }}>Email</span>
              <span style={{ color: '#ccc' }}>{toast.citizenEmail}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#aaa', flexShrink: 0 }}>Location</span>
              <span style={{ color: '#ccc', textAlign: 'right' }}>{toast.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#aaa' }}>GPS</span>
              <span style={{ color: '#3A86FF', fontFamily: 'monospace', fontSize: '0.72rem' }}>{toast.lat?.toFixed(5)}, {toast.lng?.toFixed(5)}</span>
            </div>
            {toast.contacts?.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#aaa' }}>Contacts</span>
                <span style={{ color: '#ccc' }}>{toast.contacts.length} alerted</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleView}
              style={{ flex: 1, background: '#FF4D4F', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              View Alert <ArrowRight size={14} />
            </button>
            <button
              onClick={dismissToast}
              style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' }}
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Police Control Dashboard';
    if (path === '/hotspot-map') return 'Crime Hotspot Analysis';
    if (path === '/fir-management') return 'FIR Records & Management';
    if (path === '/analytics') return 'Surveillance Analytics';
    if (path === '/alerts') return 'SOS & Emergency Alerts';
    if (path === '/settings') return 'Settings & Preferences';
    if (path === '/patrol-routes') return 'AI Patrol Route Generator';
    if (path === '/crime-prediction') return 'Crime Prediction & Risk Intelligence';
    if (path === '/accident-monitoring') return 'IRAD Accident Monitoring System';
    if (path === '/admin') return 'Admin Control Panel';
    if (path === '/safety-map') return 'Citizen Safety Map';
    if (path === '/nearby-stations') return 'Nearby Police Stations & Directions';
    if (path === '/behavioral-analysis') return 'Behavioral Intelligence & Risk';
    if (path === '/sos') return 'SOS Emergency';
    if (path === '/risk-analysis') return 'Risk Analysis & Dispatch';
    return 'SAFE-CITY AI';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '240px', width: 'calc(100% - 240px)', position: 'relative' }}>
        <TopBar title={getTitle()} />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ padding: '32px', minHeight: 'calc(100vh - 70px)' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ✅ Global SOS Toast — visible ANY page police is on */}
      <SOSToastOverlay />
    </div>
  );
};

export default Layout;
