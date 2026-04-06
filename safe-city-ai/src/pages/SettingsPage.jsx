import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Shield, Bell, Moon, Sun, Globe, Lock,
  Database, Smartphone, Save, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const isCitizen = user?.role === 'citizen';

  const [form, setForm] = useState({
    name: user?.name || 'Officer',
    email: user?.email || '',
    phone: '+91 98765 43210',
    badge: user?.badge || '—',
    currentPass: '',
    newPass: '',
    notifySOS: true,
    notifyFIR: true,
    notifyMap: false,
    twoFA: true,
    sessionTimeout: '30',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Citizens only see Profile; police/admin see all sections
  const sections = isCitizen
    ? [{ id: 'profile', label: 'Profile', icon: User }]
    : [
        { id: 'profile',       label: 'Profile',       icon: User },
        { id: 'security',      label: 'Security',      icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance',    label: 'Appearance',    icon: Globe },
        { id: 'system',        label: 'System',        icon: Database },
      ];

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      {children}
    </div>
  );

  const Input = ({ value, onChange, type = 'text', placeholder, icon: Icon }) => (
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)',
          borderRadius: '10px', color: 'white', outline: 'none', paddingLeft: Icon ? '40px' : '14px',
          paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px',
          fontSize: '0.9rem', transition: 'border-color 0.3s', boxSizing: 'border-box'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
      />
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
      width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative',
      background: checked ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s', flexShrink: 0
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px', width: '18px', height: '18px',
        borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }} />
    </div>
  );

  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div>
        <p style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
      <Toggle checked={checked} onChange={() => onChange(!checked)} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure your SAFE-CITY AI profile and preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isCitizen ? '1fr' : '220px 1fr', gap: '24px' }}>

        {/* Sidebar nav — hidden for citizens since only Profile exists */}
        {!isCitizen && (
          <div className="glass-panel" style={{ padding: '16px', height: 'fit-content' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '10px', marginBottom: '4px', fontSize: '0.88rem', fontWeight: '600',
                background: activeSection === s.id ? 'var(--primary-color)' : 'transparent',
                color: activeSection === s.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s', textAlign: 'left',
                border: 'none', cursor: 'pointer'
              }}>
                <s.icon size={18} /> {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="glass-panel" style={{ padding: '32px' }}>

          {/* Profile — for ALL roles, but citizens don't get Badge/ID */}
          {(activeSection === 'profile' || isCitizen) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '28px' }}>Profile Information</h2>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900', color: 'white', flexShrink: 0 }}>
                  {(form.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: '0 0 4px' }}>{form.name}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 8px' }}>{form.email}</p>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '3px 10px', borderRadius: '6px', background: isCitizen ? 'rgba(46,204,113,0.15)' : 'rgba(58,134,255,0.15)', color: isCitizen ? '#2ECC71' : 'var(--primary-color)', textTransform: 'capitalize' }}>
                    {user?.role || 'citizen'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <Field label="Full Name">
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} icon={User} />
                </Field>
                <Field label="Email">
                  <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} icon={Smartphone} />
                </Field>
                {/* Badge/ID only for police and admin */}
                {!isCitizen && (
                  <Field label="Badge / ID">
                    <Input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} icon={Shield} />
                  </Field>
                )}
              </div>
            </motion.div>
          )}

          {/* Security — police/admin only */}
          {!isCitizen && activeSection === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '28px' }}>Security Settings</h2>
              <Field label="Current Password">
                <div style={{ position: 'relative' }}>
                  <Input type={showPass ? 'text' : 'password'} value={form.currentPass} onChange={e => setForm({ ...form, currentPass: e.target.value })} placeholder="••••••••" icon={Lock} />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="New Password">
                <Input type="password" value={form.newPass} onChange={e => setForm({ ...form, newPass: e.target.value })} placeholder="••••••••" icon={Lock} />
              </Field>
              <div style={{ padding: '20px', background: 'rgba(58,134,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Authenticator App (2FA)</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Use Google Authenticator or Authy to secure your account.</p>
                  </div>
                  <Shield size={32} color="var(--primary-color)" />
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'white', padding: '10px', borderRadius: '8px' }}>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=OTP-SAFE-CITY-AI-POLICE-01" alt="QR Code" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Secret Key</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--primary-color)' }}>ABCD-1234-EFGH-5678</p>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '700', padding: 0, cursor: 'pointer', marginTop: '4px' }}>REGENERATE KEY</button>
                  </div>
                </div>
                <ToggleRow label="Enforce 2FA" desc="Require authenticator for every police login" checked={form.twoFA} onChange={v => setForm({ ...form, twoFA: v })} />
              </div>
              <Field label="Session Timeout (minutes)">
                <select value={form.sessionTimeout} onChange={e => setForm({ ...form, sessionTimeout: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }}>
                  {['15', '30', '60', '120'].map(v => <option key={v} value={v}>{v} minutes</option>)}
                </select>
              </Field>
            </motion.div>
          )}

          {/* Notifications — police/admin only */}
          {!isCitizen && activeSection === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '28px' }}>Notification Preferences</h2>
              <ToggleRow label="SOS Alert Notifications" desc="Get notified for every new SOS event" checked={form.notifySOS} onChange={v => setForm({ ...form, notifySOS: v })} />
              <ToggleRow label="FIR Updates" desc="Notify when a FIR is created or updated" checked={form.notifyFIR} onChange={v => setForm({ ...form, notifyFIR: v })} />
              <ToggleRow label="Hotspot Map Changes" desc="Alert on new high-risk zone designations" checked={form.notifyMap} onChange={v => setForm({ ...form, notifyMap: v })} />
            </motion.div>
          )}

          {/* Appearance — police/admin only */}
          {!isCitizen && activeSection === 'appearance' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '28px' }}>Appearance</h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { id: 'dark',  label: 'Dark Mode',  icon: Moon, desc: 'Ideal for monitoring rooms' },
                  { id: 'light', label: 'Light Mode', icon: Sun,  desc: 'Lighter interface for daytime use' },
                ].map(opt => (
                  <div key={opt.id} onClick={() => { if (theme !== opt.id) toggleTheme(); }}
                    style={{ flex: 1, padding: '24px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', background: theme === opt.id ? 'rgba(58,134,255,0.1)' : 'rgba(0,0,0,0.2)', border: `2px solid ${theme === opt.id ? 'var(--primary-color)' : 'var(--border-color)'}`, transition: 'all 0.3s' }}>
                    <opt.icon size={32} color={theme === opt.id ? 'var(--primary-color)' : 'var(--text-secondary)'} style={{ marginBottom: '12px' }} />
                    <p style={{ fontWeight: '700', marginBottom: '6px' }}>{opt.label}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                    {theme === opt.id && <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}><CheckCircle size={18} color="var(--primary-color)" /></div>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* System — police/admin only */}
          {!isCitizen && activeSection === 'system' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '28px' }}>System Information</h2>
              {[
                ['App Version', 'SAFE-CITY AI v1.0.0'],
                ['Backend', 'FastAPI @ localhost:8888'],
                ['Database', 'SQLite (safecity_v4.db)'],
                ['Blockchain', 'Polygon Mumbai Testnet'],
                ['Cache', 'Redis (optional)'],
                ['Build', 'Vite + React 19'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{k}</span>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', fontFamily: ['Build', 'Blockchain'].includes(k) ? 'monospace' : 'inherit' }}>{v}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Save Button */}
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
            {saved && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#2ECC71', fontSize: '0.88rem', fontWeight: '700', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <CheckCircle size={16} /> Saved successfully!
              </motion.span>
            )}
            <button className="btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
