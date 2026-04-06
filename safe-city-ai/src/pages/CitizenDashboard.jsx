import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
  const { user } = useAuth();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>Citizen Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome, {user?.name || 'Citizen'}!</p>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px' }}>Citizen Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Citizen features are currently disabled.</p>
      </motion.div>
    </div>
  );
};

export default CitizenDashboard;
