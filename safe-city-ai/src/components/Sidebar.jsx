import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map as MapIcon, FileText, Activity,
  Bell, Settings, LogOut, Shield, User, Users, Route as RouteIcon, Brain, AlertTriangle
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useSOS } from '../context/SOSContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const { unreadCount, clearPending } = useSOS();
  const navigate = useNavigate();

  const policeMenu = [
    { icon: FileText,      label: 'FIR Entry',          path: '/fir-management' },
    { icon: MapIcon,       label: 'Hotspot Map',         path: '/hotspot-map' },
    { icon: AlertTriangle, label: 'Accident Monitor',    path: '/accident-monitoring', badge: 'IRAD' },
    { icon: RouteIcon,     label: 'AI Patrol Routes',    path: '/patrol-routes' },
    { icon: Brain,         label: 'Crime Prediction',    path: '/crime-prediction', badge: 'ML' },
    { icon: Shield,        label: 'Risk Analysis',       path: '/risk-analysis', badge: 'NEW' },
    { icon: Bell,          label: 'SOS Alerts',          path: '/alerts' },
  ];

  const citizenMenu = [
    { icon: MapIcon,       label: 'Safety Map',         path: '/safety-map' },
    { icon: Shield,        label: 'Nearby Stations',    path: '/nearby-stations', badge: 'GPS' },
    { icon: Bell,          label: 'Alerts',             path: '/alerts' },
    { icon: AlertTriangle, label: 'SOS Emergency',      path: '/sos' },
    { icon: Settings,      label: 'Settings',           path: '/settings' },
  ];

  const adminMenu = [
    { icon: Users,         label: 'Admin Overview',      path: '/admin' },
    { icon: Activity,      label: 'Analytics & AI',      path: '/admin' },
    { icon: AlertTriangle, label: 'Accident Monitor',    path: '/accident-monitoring', badge: 'IRAD' },
    { icon: MapIcon,       label: 'Hotspot Map',         path: '/hotspot-map' },
    { icon: Brain,         label: 'Crime Prediction',    path: '/crime-prediction', badge: 'ML' },
    { icon: Bell,          label: 'SOS Alerts',          path: '/alerts' },
    { icon: FileText,      label: 'FIR Reports',         path: '/fir-management' },
    { icon: Settings,      label: 'Settings',            path: '/settings' },
  ];

  const menuItems =
    user?.role === 'citizen' ? citizenMenu :
    user?.role === 'admin'   ? adminMenu :
    policeMenu;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleColors = {
    police: '#3A86FF',
    citizen: '#2ECC71',
    admin: '#8B5CF6',
  };
  const roleColor = roleColors[user?.role] || '#3A86FF';

  return (
    <aside
      className="glass-panel"
      style={{
        width: '240px', height: '100vh', display: 'flex', flexDirection: 'column',
        padding: '24px 16px', borderRadius: '0', borderRight: '1px solid var(--border-color)',
        position: 'fixed', left: 0, top: 0, zIndex: 1000, overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 8px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(58, 134, 255, 0.3)' }}>
          <Shield size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>SAFE-CITY</h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {user?.role === 'admin' ? 'Admin Control' : user?.role === 'citizen' ? 'Citizen Portal' : 'Alpha-Control'}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {menuItems.map((item, idx) => (
          <motion.div
            key={item.path + item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <NavLink
              to={item.path}
              onClick={() => {
                if (item.path === '/alerts') clearPending();
              }}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '12px', marginBottom: '4px',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? `linear-gradient(90deg, ${roleColor} 0%, ${roleColor}88 100%)` : 'transparent',
                textDecoration: 'none', fontSize: '0.9rem',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? `0 4px 15px ${roleColor}33` : 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} color={isActive ? 'white' : 'var(--text-secondary)'} />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge && (
                    <span style={{ padding: '1px 7px', borderRadius: '6px', background: '#A855F7', fontSize: '0.55rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
                      {item.badge}
                    </span>
                  )}

                  {/* ✅ Live SOS badge on Alerts item — police & admin only */}
                  {item.path === '/alerts' && unreadCount > 0 && user?.role !== 'citizen' && (
                    <motion.span
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                      style={{
                        minWidth: '22px', height: '22px', borderRadius: '11px',
                        background: '#FF4D4F', fontSize: '0.7rem', fontWeight: '900',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 5px',
                        boxShadow: '0 0 10px rgba(255,77,79,0.75)',
                      }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${roleColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${roleColor}44`, flexShrink: 0 }}>
            <User size={18} color={roleColor} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.name || 'Officer'}
            </p>
            <p style={{ fontSize: '0.7rem', color: roleColor, margin: 0, textTransform: 'capitalize', fontWeight: '700' }}>
              {user?.role || 'police'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', color: '#FF4D4F', background: 'transparent', border: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,79,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
