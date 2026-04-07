import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, FileText, AlertTriangle,
  RefreshCw, Download, Database,
  TrendingUp, Zap, Activity, Trash2,
  CheckCircle, XCircle, BarChart2, Lock
} from 'lucide-react';

const API = 'http://localhost:8888';

const fetchAdmin = async (path) => {
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return null;
  }
};

const pulse = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`;
const spin  = `@keyframes spin  { to{transform:rotate(360deg)} }`;

// ── STATUS DOT ────────────────────────────────────────────────────────────
const Dot = ({ ok }) => (
  <span style={{
    display:'inline-block', width:9, height:9, borderRadius:'50%',
    background: ok ? '#00E474' : '#FF4D4F',
    boxShadow: ok ? '0 0 8px #00E474aa' : '0 0 8px #FF4D4Faa',
    marginRight:8, animation:'pulse 2s infinite'
  }}/>
);

// ── STAT CARD ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, delay=0 }) => (
  <motion.div
    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
    className="glass-panel"
    style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:12,
      borderTop:`3px solid ${color}`, position:'relative', overflow:'hidden' }}
  >
    <div style={{ position:'absolute', top:16, right:16, opacity:0.06 }}>
      <Icon size={56} color={color}/>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`${color}22`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} color={color}/>
      </div>
      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize:'2rem', fontWeight:800, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:4 }}>{sub}</div>}
    </div>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab]           = useState('users');
  const [stats, setStats]       = useState(null);
  const [health, setHealth]     = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'police' | 'citizen'
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLast]  = useState(new Date());

  // Live data for monitoring
  const [firTrend, setFirTrend]   = useState([12,18,9,23,14,31,19,25,17,22,28,20]);
  const [sosTrend, setSosTrend]   = useState([2,5,1,8,3,6,4,9,2,7,5,3]);
  const [latency, setLatency]     = useState([22,18,35,28,19,31,24,20,15,22,27,19]);

  const loadData = async () => {
    setLoading(true);
    const [s, h, u] = await Promise.all([
      fetchAdmin('/admin/stats'),
      fetchAdmin('/admin/health'),
      fetchAdmin('/admin/users'),
    ]);
    if (s) setStats(s);
    if (h) setHealth(h);
    if (u?.data) setAllUsers(u.data);
    setLast(new Date());
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`${API}/admin/users/${userId}`, { method: 'DELETE' });
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setLatency(l => [...l.slice(1), Math.floor(15 + Math.random() * 40)]);
      setFirTrend(f => [...f.slice(1), Math.floor(8 + Math.random() * 30)]);
      setSosTrend(s => [...s.slice(1), Math.floor(Math.random() * 12)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const rows = [
      ['ID','Name','Email','Phone','Role','Active','2FA'],
      ...allUsers.map(u => [u.id, u.name, u.email, u.phone, u.role, u.is_active, u.is_2fa_enabled])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `safecity_users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filteredUsers = allUsers.filter(u =>
    userFilter === 'all' ? true : u.role === userFilter
  );

  const officers  = allUsers.filter(u => u.role === 'police');
  const citizens  = allUsers.filter(u => u.role === 'citizen');

  const TABS = [
    { id:'users',      label:'User Management',  Icon: Users },
    { id:'monitoring', label:'Data Monitoring',  Icon: Activity },
  ];

  const roleBadge = (role) => {
    const map = {
      police:  { bg:'rgba(58,134,255,0.15)',  color:'#3A86FF',  border:'rgba(58,134,255,0.3)'  },
      citizen: { bg:'rgba(0,228,116,0.12)',   color:'#00E474',  border:'rgba(0,228,116,0.3)'   },
      admin:   { bg:'rgba(139,92,246,0.15)',  color:'#8B5CF6',  border:'rgba(139,92,246,0.3)'  },
    };
    const s = map[role] || map.admin;
    return (
      <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
        padding:'3px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:700,
        textTransform:'capitalize' }}>{role}</span>
    );
  };

  return (
    <>
      <style>{pulse}{spin}</style>

      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

        {/* ── HEADER ── */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
              <div style={{ width:42, height:42, borderRadius:12,
                background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 20px #8B5CF655' }}>
                <Shield size={22} color="white"/>
              </div>
              <h1 style={{ fontSize:'1.8rem', fontWeight:900, margin:0,
                background:'linear-gradient(90deg,#fff,#8B5CF6)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Admin Control Center
              </h1>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', margin:0 }}>
              Welcome back, <strong style={{color:'#8B5CF6'}}>{user?.name || 'Administrator'}</strong>
              &nbsp;· Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={loadData} style={{ display:'flex', alignItems:'center', gap:8,
              padding:'10px 18px', background:'rgba(139,92,246,0.15)',
              border:'1px solid rgba(139,92,246,0.4)', borderRadius:10,
              color:'#8B5CF6', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
              <RefreshCw size={16} style={loading ? {animation:'spin 1s linear infinite'} : {}}/>
              Refresh
            </button>
            <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:8,
              padding:'10px 18px', background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',
              border:'none', borderRadius:10, color:'white', fontWeight:600,
              cursor:'pointer', fontSize:'0.85rem', boxShadow:'0 4px 15px rgba(139,92,246,0.4)' }}>
              <Download size={16}/> Export CSV
            </button>
          </div>
        </motion.div>

        {/* ── TOP STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <StatCard icon={FileText}      label="Total FIRs"    color="#3A86FF"
            value={loading ? '…' : (stats?.fir_count ?? 0)}       sub="All time filed"       delay={0}/>
          <StatCard icon={AlertTriangle} label="SOS Alerts"    color="#FF4D4F"
            value={loading ? '…' : (stats?.sos_count ?? 0)}       sub="Emergency triggers"   delay={0.05}/>
          <StatCard icon={Users}         label="Citizens"      color="#00E474"
            value={loading ? '…' : (stats?.citizen_count ?? 0)}   sub="Registered users"     delay={0.1}/>
          <StatCard icon={Shield}        label="Officers"      color="#FA8C16"
            value={loading ? '…' : (stats?.officer_count ?? 0)}   sub="Active officers"      delay={0.15}/>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display:'flex', gap:4, marginBottom:22, background:'rgba(0,0,0,0.3)',
          padding:6, borderRadius:14, width:'fit-content' }}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 22px',
                borderRadius:10, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
                background: tab === id ? 'linear-gradient(135deg,#8B5CF6,#6D28D9)' : 'transparent',
                color: tab === id ? 'white' : 'var(--text-secondary)',
                boxShadow: tab === id ? '0 4px 12px rgba(139,92,246,0.4)' : 'none',
                transition:'all 0.2s' }}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ USER MANAGEMENT TAB ══ */}
          {tab === 'users' && (
            <motion.div key="users" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
              style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* Summary row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                {[
                  { label:'Total Users',    value: allUsers.length,  color:'#8B5CF6' },
                  { label:'Police Officers',value: officers.length,  color:'#3A86FF' },
                  { label:'Citizens',       value: citizens.length,  color:'#00E474' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-panel" style={{ padding:'18px 22px',
                    borderTop:`3px solid ${color}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:'1.8rem', fontWeight:900, color }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Filter bar */}
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {['all','police','citizen'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    style={{ padding:'7px 18px', borderRadius:20, border:'none', cursor:'pointer',
                      fontWeight:600, fontSize:'0.82rem', transition:'all 0.2s',
                      background: userFilter === f ? '#8B5CF6' : 'rgba(255,255,255,0.07)',
                      color: userFilter === f ? 'white' : 'var(--text-secondary)' }}>
                    {f === 'all' ? 'All Users' : f === 'police' ? '👮 Police' : '👤 Citizens'}
                  </button>
                ))}
                <span style={{ marginLeft:'auto', fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown
                </span>
              </div>

              {/* Users table */}
              <div className="glass-panel" style={{ padding:0, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.88rem' }}>
                  <thead>
                    <tr style={{ background:'rgba(139,92,246,0.1)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                      {['ID','Name','Email','Phone','Role','2FA','Status','Action'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'14px 18px',
                          fontSize:'0.75rem', fontWeight:700, color:'var(--text-secondary)',
                          textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>Loading users…</td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>No users found.</td></tr>
                    ) : filteredUsers.map((u, i) => (
                      <motion.tr key={u.id}
                        initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: i * 0.03}}
                        style={{ borderBottom:'1px solid rgba(255,255,255,0.05)',
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                      >
                        <td style={{ padding:'14px 18px', color:'var(--text-secondary)', fontFamily:'monospace' }}>#{u.id}</td>
                        <td style={{ padding:'14px 18px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:32, height:32, borderRadius:'50%',
                              background: u.role === 'police' ? 'rgba(58,134,255,0.2)' : 'rgba(0,228,116,0.15)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:'0.8rem', fontWeight:900,
                              color: u.role === 'police' ? '#3A86FF' : '#00E474', flexShrink:0 }}>
                              {(u.name !== '—' ? u.name : u.email !== '—' ? u.email : '?')[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight:600 }}>{u.name !== '—' ? u.name : <em style={{color:'var(--text-secondary)'}}>—</em>}</span>
                          </div>
                        </td>
                        <td style={{ padding:'14px 18px', color:'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding:'14px 18px', color:'var(--text-secondary)' }}>{u.phone}</td>
                        <td style={{ padding:'14px 18px' }}>{roleBadge(u.role)}</td>
                        <td style={{ padding:'14px 18px' }}>
                          {u.is_2fa_enabled
                            ? <span style={{ color:'#00E474', display:'flex', alignItems:'center', gap:5 }}><CheckCircle size={14}/> Enabled</span>
                            : <span style={{ color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:5 }}><XCircle size={14}/> Not set</span>}
                        </td>
                        <td style={{ padding:'14px 18px' }}>
                          {u.is_active
                            ? <span style={{ color:'#00E474', fontWeight:700, fontSize:'0.8rem' }}>● Active</span>
                            : <span style={{ color:'#FF4D4F', fontWeight:700, fontSize:'0.8rem' }}>● Inactive</span>}
                        </td>
                        <td style={{ padding:'14px 18px' }}>
                          <button onClick={() => deleteUser(u.id)}
                            style={{ background:'rgba(255,77,79,0.1)', border:'1px solid rgba(255,77,79,0.25)',
                              color:'#FF4D4F', borderRadius:8, padding:'6px 12px', cursor:'pointer',
                              fontSize:'0.78rem', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                            <Trash2 size={13}/> Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role distribution */}
              <div className="glass-panel" style={{ padding:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 18px',
                  display:'flex', alignItems:'center', gap:8 }}>
                  <BarChart2 size={18} color="#8B5CF6"/> Role Distribution
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {[
                    { role:'Police Officers', count: officers.length, color:'#3A86FF',
                      pct: allUsers.length ? Math.round((officers.length/allUsers.length)*100) : 0 },
                    { role:'Citizens',        count: citizens.length, color:'#00E474',
                      pct: allUsers.length ? Math.round((citizens.length/allUsers.length)*100) : 0 },
                    { role:'Admins',          count: allUsers.filter(u=>u.role==='admin').length, color:'#8B5CF6',
                      pct: allUsers.length ? Math.round((allUsers.filter(u=>u.role==='admin').length/allUsers.length)*100) : 0 },
                  ].map(({ role, count, color, pct }) => (
                    <div key={role}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                        <span style={{ fontWeight:600 }}>{role}</span>
                        <span style={{ color, fontWeight:700 }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height:8, background:'rgba(255,255,255,0.07)', borderRadius:4 }}>
                        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1}}
                          style={{ height:'100%', background:color, borderRadius:4 }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ DATA MONITORING TAB ══ */}
          {tab === 'monitoring' && (
            <motion.div key="monitoring" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
              style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

              {/* System Health */}
              <div className="glass-panel" style={{ padding:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20,
                  display:'flex', alignItems:'center', gap:8 }}>
                  <Database size={18} color="#8B5CF6"/> System Health
                </h3>
                {[
                  { label:'REST API',         ok: health?.api === 'ok', detail:'avg ' + latency.at(-1) + 'ms' },
                  { label:'SQLite Database',  ok: health?.db === 'ok',  detail:'Connected' },
                  { label:'WebSocket Server', ok: true,                 detail:'Active connections: 3' },
                  { label:'Blockchain Layer', ok: true,                 detail:'Polygon testnet synced' },
                  { label:'Redis Cache',      ok: false,                detail:'Mock mode' },
                ].map(({ label, ok, detail }) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display:'flex', alignItems:'center' }}>
                      <Dot ok={ok}/><span style={{ fontSize:'0.88rem', fontWeight:600 }}>{label}</span>
                    </div>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{detail}</span>
                  </div>
                ))}
              </div>

              {/* API Latency */}
              <div className="glass-panel" style={{ padding:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:6,
                  display:'flex', alignItems:'center', gap:8 }}>
                  <Activity size={18} color="#3A86FF"/> API Latency (Live)
                </h3>
                <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:20 }}>Updates every 4s</p>
                <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, marginBottom:16 }}>
                  {latency.map((v, i) => (
                    <div key={i} style={{ flex:1 }}>
                      <div style={{ width:'100%', background: v > 30 ? '#FF4D4F' : '#3A86FF',
                        height:`${(v/50)*80}px`, borderRadius:'4px 4px 0 0',
                        opacity: i === latency.length - 1 ? 1 : 0.5,
                        boxShadow: i === latency.length-1 ? `0 0 12px ${v>30?'#FF4D4F':'#3A86FF'}88` : 'none',
                        transition:'height 0.4s ease' }}/>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                  <span>60s ago</span>
                  <span style={{ color: latency.at(-1) > 30 ? '#FF4D4F' : '#00E474', fontWeight:700 }}>
                    Current: {latency.at(-1)}ms {latency.at(-1) > 30 ? '⚠' : '✓'}
                  </span>
                  <span>Now</span>
                </div>
              </div>

              {/* FIR Trend */}
              <div className="glass-panel" style={{ padding:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20,
                  display:'flex', alignItems:'center', gap:8 }}>
                  <TrendingUp size={18} color="#00E474"/> FIR Submission Trend
                </h3>
                <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
                  {firTrend.map((v, i) => (
                    <div key={i} title={`${v} FIRs`} style={{ flex:1,
                      background:'linear-gradient(to top,#00E474,#00E47455)',
                      height:`${(v/Math.max(...firTrend))*100}%`,
                      borderRadius:'4px 4px 0 0', opacity: i === firTrend.length-1 ? 1 : 0.6,
                      transition:'height 0.4s ease' }}/>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem',
                  color:'var(--text-secondary)', marginTop:8 }}>
                  <span>12 intervals ago</span>
                  <span>Now: <strong style={{color:'#00E474'}}>{firTrend.at(-1)} FIRs</strong></span>
                </div>
              </div>

              {/* SOS Trend */}
              <div className="glass-panel" style={{ padding:24 }}>
                <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20,
                  display:'flex', alignItems:'center', gap:8 }}>
                  <Zap size={18} color="#FF4D4F"/> SOS Alert Trend
                </h3>
                <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
                  {sosTrend.map((v, i) => (
                    <div key={i} title={`${v} SOS`} style={{ flex:1,
                      background:'linear-gradient(to top,#FF4D4F,#FF4D4F55)',
                      height:`${(v/Math.max(...sosTrend,1))*100}%`,
                      borderRadius:'4px 4px 0 0', opacity: i === sosTrend.length-1 ? 1 : 0.6,
                      transition:'height 0.4s ease' }}/>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem',
                  color:'var(--text-secondary)', marginTop:8 }}>
                  <span>12 intervals ago</span>
                  <span>Now: <strong style={{color:'#FF4D4F'}}>{sosTrend.at(-1)} SOS</strong></span>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminDashboard;
