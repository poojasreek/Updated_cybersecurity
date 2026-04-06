import React from 'react';
import { Search, Bell, Sun, Moon, Calendar, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, title: 'Critical SOS Alert', message: 'Assistance needed in T. Nagar Sector 4', time: '2m ago', type: 'critical' },
    { id: 2, title: 'New FIR Filed', message: 'Case #2026-042 filed by Officer Rajesh', time: '15m ago', type: 'info' },
    { id: 3, title: 'System Status', message: 'Blockchain node sync complete', time: '1h ago', type: 'success' },
  ];

  return (
    <header className="topbar" style={{
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'rgba(11, 19, 43, 0.5)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 900
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{title}</h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          minWidth: '300px'
        }}>
          <Search size={18} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search FIR, Officer, Area..."
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 12px', 
          background: 'rgba(46, 204, 113, 0.1)', 
          borderRadius: '10px',
          border: '1px solid rgba(46, 204, 113, 0.2)',
          marginRight: '12px'
        }}>
          <CheckCircle size={16} color="#2ECC71" />
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2ECC71' }}>System Online</span>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'var(--panel-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            transition: 'all 0.3s'
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--panel-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '18px',
              height: '18px',
              background: '#FF4D4F',
              borderRadius: '50%',
              fontSize: '10px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: '2px solid var(--bg-color)',
              boxShadow: '0 0 10px rgba(255, 77, 79, 0.5)'
            }}>3</span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '320px',
                  padding: '16px',
                  zIndex: 1000,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0 }}>Recent Alerts</h4>
                  <button style={{ fontSize: '0.75rem', color: 'var(--primary-color)' }}>Mark all read</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map((n) => (
                    <div key={n.id} style={{
                      padding: '12px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${n.type === 'critical' ? '#FF4D4F' : '#3A86FF'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{n.message}</p>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '16px',
                  background: 'var(--panel-bg)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: '1px solid var(--border-color)'
                }}>View All Notifications</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 6px 6px 12px',
          background: 'var(--panel-bg)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Police Officer</p>
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.8rem'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
