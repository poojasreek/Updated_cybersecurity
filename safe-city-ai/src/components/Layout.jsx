import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Layout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Generate title based on route
  const getTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Police Control Dashboard';
    if (path === '/hotspot-map') return 'Crime Hotspot Analysis';
    if (path === '/fir-management') return 'FIR Records & Management';
    if (path === '/analytics') return 'Surveillance Analytics';
    if (path === '/alerts') return 'SOS & Emergency Alerts';
    if (path === '/settings') return 'Settings & Preferences';
    if (path === '/admin') return 'Admin Control Panel';
    if (path === '/safety-map') return 'Citizen Safety Map';
    return 'SAFE-CITY AI';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '240px', 
        width: 'calc(100% - 240px)',
        position: 'relative'
      }}>
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
    </div>
  );
};

export default Layout;
