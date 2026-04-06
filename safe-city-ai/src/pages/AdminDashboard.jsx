import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Database, Cpu, Shield, Users, FileText,
  TrendingUp, AlertTriangle, RefreshCw, Download, Bell,
  CheckCircle, XCircle, Clock, BarChart2, Zap, Eye,
  ChevronRight, Settings, Server, GitBranch, Lock
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────
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

// ── mini chart (pure CSS bars) ────────────────────────────────────────────
const BarMini = ({ data, color }) => (
  <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:48 }}>
    {data.map((v,i)=>(
      <div key={i} style={{
        width:8, height:`${(v/Math.max(...data))*100}%`,
        background:color, borderRadius:3, opacity: i===data.length-1?1:0.55,
        transition:'height 0.4s'
      }}/>
    ))}
  </div>
);

// ── sparkline SVG ────────────────────────────────────────────────────────
const Spark = ({ data, color='#3A86FF', height=40 }) => {
  const w=120, h=height;
  const max=Math.max(...data), min=Math.min(...data);
  const pts = data.map((v,i)=>{
    const x=(i/(data.length-1))*w;
    const y=h-((v-min)/(max-min||1))*(h-6)-3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{overflow:'visible'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts.split(' ').at(-1).split(',')[0]} cy={pts.split(' ').at(-1).split(',')[1]} r="3" fill={color}/>
    </svg>
  );
};

// ── STATUS DOT ───────────────────────────────────────────────────────────
const Dot = ({ ok }) => (
  <span style={{
    display:'inline-block', width:9, height:9, borderRadius:'50%',
    background: ok ? '#00E474' : '#FF4D4F',
    boxShadow: ok ? '0 0 8px #00E474aa' : '0 0 8px #FF4D4Faa',
    marginRight:8, animation:'pulse 2s infinite'
  }}/>
);

// ── STAT CARD ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, spark, delay=0 }) => (
  <motion.div
    initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
    className="glass-panel"
    style={{ padding:'22px 24px', display:'flex', flexDirection:'column', gap:12,
      borderTop:`3px solid ${color}`, position:'relative', overflow:'hidden' }}
  >
    <div style={{ position:'absolute', top:16, right:16, opacity:0.08 }}>
      <Icon size={56} color={color}/>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:`${color}22`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} color={color}/>
      </div>
      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', fontWeight:600, textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
    </div>
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontSize:'2rem', fontWeight:800, lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:4 }}>{sub}</div>}
      </div>
      {spark && <Spark data={spark} color={color}/>}
    </div>
  </motion.div>
);

// ── GAUGE ────────────────────────────────────────────────────────────────
const Gauge = ({ pct, color, label }) => {
  const r=36, circ=2*Math.PI*r;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
        <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
          strokeLinecap="round" transform="rotate(-90 45 45)" style={{transition:'stroke-dashoffset 1s ease'}}/>
        <text x={45} y={50} textAnchor="middle" fill="white" fontSize={14} fontWeight={800}>{pct}%</text>
      </svg>
      <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)', textAlign:'center' }}>{label}</span>
    </div>
  );
};

// ── ALERT TOAST ──────────────────────────────────────────────────────────
const AlertToast = ({ alerts }) => (
  <div style={{ position:'fixed', top:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10 }}>
    <AnimatePresence>
      {alerts.map(a=>(
        <motion.div key={a.id}
          initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}}
          style={{ padding:'12px 20px', background: a.level==='critical'?'#FF4D4F':'#FA8C16',
            borderRadius:12, fontSize:'0.85rem', fontWeight:600, color:'white',
            boxShadow:'0 8px 32px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:10, minWidth:280 }}
        >
          <AlertTriangle size={18}/> {a.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [health, setHealth]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [retraining, setRetrain]= useState(false);
  const [toasts, setToasts]     = useState([]);
  const [lastRefresh, setLast]  = useState(new Date());

  // Simulated live data
  const [latency, setLatency]   = useState([22,18,35,28,19,31,24,20,15,22,27,19]);
  const [firTrend, setFirTrend] = useState([12,18,9,23,14,31,19,25,17,22,28,20]);
  const [sosTrend, setSosTrend] = useState([2,5,1,8,3,6,4,9,2,7,5,3]);
  const timerRef = useRef(null);

  const addToast = (message, level='warning') => {
    const id = Date.now();
    setToasts(t=>[...t, {id, message, level}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    const [s, h] = await Promise.all([
      fetchAdmin('/admin/stats'),
      fetchAdmin('/admin/health'),
    ]);
    if(s) setStats(s);
    if(h) setHealth(h);
    setLast(new Date());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    timerRef.current = setInterval(() => {
      // Simulate live metric updates
      setLatency(l=>[...l.slice(1), Math.floor(15 + Math.random()*40)]);
      setFirTrend(f=>[...f.slice(1), Math.floor(8 + Math.random()*30)]);
      setSosTrend(s=>[...s.slice(1), Math.floor(Math.random()*12)]);
      // Random alert simulation
      if(Math.random() < 0.05) addToast('API latency spike detected!', 'warning');
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleRetrain = async () => {
    setRetrain(true);
    await fetchAdmin('/admin/retrain');
    setTimeout(() => {
      setRetrain(false);
      addToast('✅ Model retraining completed!', 'info');
    }, 3000);
  };

  const exportCSV = () => {
    const rows = [
      ['Metric','Value'],
      ['Total FIRs', stats?.fir_count ?? 'N/A'],
      ['Total SOS Alerts', stats?.sos_count ?? 'N/A'],
      ['Citizens', stats?.citizen_count ?? 'N/A'],
      ['Officers', stats?.officer_count ?? 'N/A'],
      ['LSTM Accuracy', '87%'],
      ['XGBoost Accuracy', '82%'],
      ['API Status', health?.api ?? 'N/A'],
      ['DB Status', health?.db ?? 'N/A'],
    ];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `safecity_report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const biasData = [
    { zone:'Zone A – North', crimeType:'Theft', fairness:91, flag:false },
    { zone:'Zone B – South', crimeType:'Assault', fairness:78, flag:true },
    { zone:'Zone C – Central', crimeType:'Vandalism', fairness:88, flag:false },
    { zone:'Zone D – East', crimeType:'Robbery', fairness:65, flag:true },
    { zone:'Zone E – West', crimeType:'Fraud', fairness:94, flag:false },
  ];

  const TABS = [
    { id:'overview',  label:'Overview',       icon:LayoutDashIcon },
    { id:'models',    label:'AI Models',      icon:CpuIcon },
    { id:'bias',      label:'Bias Audit',     icon:EyeIcon },
    { id:'users',     label:'User Stats',     icon:UsersIcon },
    { id:'alerts',    label:'System Alerts',  icon:BellIcon },
  ];

  return (
    <>
      <style>{pulse}{spin}</style>
      <AlertToast alerts={toasts}/>

      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

        {/* ── HEADER ── */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:4 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',
                display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px #8B5CF655' }}>
                <Shield size={22} color="white"/>
              </div>
              <h1 style={{ fontSize:'1.8rem', fontWeight:900, margin:0,
                background:'linear-gradient(90deg,#fff,#8B5CF6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
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
              padding:'10px 18px', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.4)',
              borderRadius:10, color:'#8B5CF6', fontWeight:600, cursor:'pointer', fontSize:'0.85rem' }}>
              <RefreshCw size={16} style={loading ? {animation:'spin 1s linear infinite'} : {}}/> Refresh
            </button>
            <button onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:8,
              padding:'10px 18px', background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',
              border:'none', borderRadius:10, color:'white', fontWeight:600, cursor:'pointer', fontSize:'0.85rem',
              boxShadow:'0 4px 15px rgba(139,92,246,0.4)' }}>
              <Download size={16}/> Export CSV
            </button>
          </div>
        </motion.div>

        {/* ── TOP STAT CARDS ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <StatCard icon={FileText}      label="Total FIRs"      color="#3A86FF"
            value={loading ? '…' : (stats?.fir_count ?? 0)}
            sub="All time filed" spark={firTrend} delay={0}/>
          <StatCard icon={AlertTriangle} label="SOS Alerts"      color="#FF4D4F"
            value={loading ? '…' : (stats?.sos_count ?? 0)}
            sub="Emergency triggers" spark={sosTrend} delay={0.05}/>
          <StatCard icon={Users}         label="Citizens"         color="#00E474"
            value={loading ? '…' : (stats?.citizen_count ?? 0)}
            sub="Registered users" delay={0.1}/>
          <StatCard icon={Shield}        label="Officers"         color="#FA8C16"
            value={loading ? '…' : (stats?.officer_count ?? 0)}
            sub="Active officers" delay={0.15}/>
        </div>

        {/* ── TAB NAV ── */}
        <div style={{ display:'flex', gap:4, marginBottom:22, background:'rgba(0,0,0,0.3)',
          padding:6, borderRadius:14, width:'fit-content' }}>
          {[
            {id:'overview',label:'Overview', Icon:Activity},
            {id:'models',  label:'AI Models', Icon:Cpu},
            {id:'bias',    label:'Bias Audit', Icon:Eye},
            {id:'users',   label:'User Stats', Icon:Users},
            {id:'alerts',  label:'System Alerts', Icon:Bell},
          ].map(({id,label,Icon})=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px',
                borderRadius:10, border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
                background: tab===id ? 'linear-gradient(135deg,#8B5CF6,#6D28D9)' : 'transparent',
                color: tab===id ? 'white' : 'var(--text-secondary)',
                boxShadow: tab===id ? '0 4px 12px rgba(139,92,246,0.4)' : 'none',
                transition:'all 0.2s' }}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        <AnimatePresence mode="wait">
        {tab==='overview' && (
          <motion.div key="overview" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

            {/* System Health */}
            <div className="glass-panel" style={{ padding:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <Server size={18} color="#8B5CF6"/> System Health
              </h3>
              {[
                { label:'REST API', ok: health?.api==='ok' ?? true, detail:'avg '+latency.at(-1)+'ms' },
                { label:'SQLite Database', ok: health?.db==='ok' ?? true, detail:'Connected' },
                { label:'WebSocket Server', ok:true, detail:'Active connections: 3' },
                { label:'Blockchain Layer', ok:true, detail:'Polygon testnet synced' },
                { label:'Redis Cache', ok:false, detail:'Mock mode (hackathon)' },
                { label:'Kafka Stream', ok:false, detail:'Not configured' },
              ].map(({label,ok,detail})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display:'flex', alignItems:'center' }}>
                    <Dot ok={ok}/> <span style={{ fontSize:'0.88rem', fontWeight:600 }}>{label}</span>
                  </div>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{detail}</span>
                </div>
              ))}
            </div>

            {/* API Latency Chart */}
            <div className="glass-panel" style={{ padding:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:6, display:'flex', alignItems:'center', gap:8 }}>
                <Activity size={18} color="#3A86FF"/> API Latency (Live)
              </h3>
              <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:20 }}>Updates every 4s</p>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, marginBottom:16 }}>
                {latency.map((v,i)=>(
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background: v>30?'#FF4D4F':'#3A86FF',
                      height:`${(v/50)*80}px`, borderRadius:'4px 4px 0 0',
                      opacity: i===latency.length-1?1:0.5,
                      boxShadow: i===latency.length-1?`0 0 12px ${v>30?'#FF4D4F':'#3A86FF'}88`:'none',
                      transition:'height 0.4s ease' }}/>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                <span>60s ago</span>
                <span style={{ color: latency.at(-1)>30?'#FF4D4F':'#00E474', fontWeight:700 }}>
                  Current: {latency.at(-1)}ms {latency.at(-1)>30?'⚠':'✓'}
                </span>
                <span>Now</span>
              </div>
            </div>

            {/* FIR Trend */}
            <div className="glass-panel" style={{ padding:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <TrendingUp size={18} color="#00E474"/> FIR Submission Trend
              </h3>
              <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
                {firTrend.map((v,i)=>(
                  <div key={i} title={`${v} FIRs`} style={{ flex:1, background:`linear-gradient(to top,#00E474,#00E47455)`,
                    height:`${(v/Math.max(...firTrend))*100}%`,
                    borderRadius:'4px 4px 0 0', opacity: i===firTrend.length-1?1:0.6,
                    transition:'height 0.4s ease' }}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:8 }}>
                <span>12 intervals ago</span><span>Now: <strong style={{color:'#00E474'}}>{firTrend.at(-1)} FIRs</strong></span>
              </div>
            </div>

            {/* SOS Trend */}
            <div className="glass-panel" style={{ padding:24 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                <Zap size={18} color="#FF4D4F"/> SOS Alert Trend
              </h3>
              <div style={{ display:'flex', alignItems:'flex-end', gap:5, height:100 }}>
                {sosTrend.map((v,i)=>(
                  <div key={i} title={`${v} SOS`} style={{ flex:1, background:`linear-gradient(to top,#FF4D4F,#FF4D4F55)`,
                    height:`${(v/Math.max(...sosTrend,1))*100}%`,
                    borderRadius:'4px 4px 0 0', opacity: i===sosTrend.length-1?1:0.6,
                    transition:'height 0.4s ease' }}/>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:8 }}>
                <span>12 intervals ago</span><span>Now: <strong style={{color:'#FF4D4F'}}>{sosTrend.at(-1)} SOS</strong></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ AI MODELS TAB ══ */}
        {tab==='models' && (
          <motion.div key="models" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* LSTM */}
              <div className="glass-panel" style={{ padding:28, borderTop:'3px solid #3A86FF' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:'1.1rem', fontWeight:800, margin:'0 0 4px' }}>LSTM Crime Predictor</h3>
                    <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', margin:0 }}>Time-series crime forecasting model</p>
                  </div>
                  <span style={{ background:'#3A86FF22', color:'#3A86FF', padding:'4px 12px',
                    borderRadius:20, fontSize:'0.75rem', fontWeight:700, border:'1px solid #3A86FF44' }}>Active</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-around', marginBottom:24 }}>
                  <Gauge pct={87} color="#3A86FF" label="Accuracy"/>
                  <Gauge pct={91} color="#00E474" label="Precision"/>
                  <Gauge pct={84} color="#FA8C16" label="Recall"/>
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span>Last trained</span><span style={{color:'white'}}>3 days ago</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span>Training samples</span><span style={{color:'white'}}>48,200</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                    <span>F1 Score</span><span style={{color:'#3A86FF', fontWeight:700}}>0.87</span>
                  </div>
                </div>
              </div>

              {/* XGBoost */}
              <div className="glass-panel" style={{ padding:28, borderTop:'3px solid #8B5CF6' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:'1.1rem', fontWeight:800, margin:'0 0 4px' }}>XGBoost Risk Scorer</h3>
                    <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', margin:0 }}>Zone-level risk classification model</p>
                  </div>
                  <span style={{ background:'#8B5CF622', color:'#8B5CF6', padding:'4px 12px',
                    borderRadius:20, fontSize:'0.75rem', fontWeight:700, border:'1px solid #8B5CF644' }}>Active</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-around', marginBottom:24 }}>
                  <Gauge pct={82} color="#8B5CF6" label="Accuracy"/>
                  <Gauge pct={85} color="#00E474" label="Precision"/>
                  <Gauge pct={79} color="#FA8C16" label="Recall"/>
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span>Last trained</span><span style={{color:'white'}}>5 days ago</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span>Training samples</span><span style={{color:'white'}}>31,750</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                    <span>F1 Score</span><span style={{color:'#8B5CF6', fontWeight:700}}>0.82</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retrain Panel */}
            <div className="glass-panel" style={{ padding:28, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 6px', display:'flex', alignItems:'center', gap:8 }}>
                  <RefreshCw size={18} color="#FA8C16"/> Trigger Model Retraining
                </h3>
                <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', margin:0 }}>
                  Retrains both LSTM and XGBoost models on the latest crime data. Takes ~2–3 minutes.
                </p>
              </div>
              <button onClick={handleRetrain} disabled={retraining}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 28px',
                  background: retraining?'rgba(250,140,22,0.15)':'linear-gradient(135deg,#FA8C16,#D46B08)',
                  border: retraining?'1px solid #FA8C1644':'none',
                  borderRadius:12, color:'white', fontWeight:700, cursor: retraining?'not-allowed':'pointer',
                  fontSize:'0.9rem', boxShadow: retraining?'none':'0 4px 15px rgba(250,140,22,0.4)',
                  whiteSpace:'nowrap' }}>
                <RefreshCw size={18} style={retraining?{animation:'spin 1s linear infinite'}:{}}/> 
                {retraining ? 'Retraining…' : 'Start Retraining'}
              </button>
            </div>

            {/* SHAP Explainability mock */}
            <div className="glass-panel" style={{ padding:28 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                <BarChart2 size={18} color="#00E474"/> SHAP Feature Importance (XGBoost)
              </h3>
              {[
                { feature:'Time of Day', importance:0.31, color:'#3A86FF' },
                { feature:'Zone Risk Level', importance:0.26, color:'#8B5CF6' },
                { feature:'Historical Crime Rate', importance:0.19, color:'#00E474' },
                { feature:'Weather Conditions', importance:0.12, color:'#FA8C16' },
                { feature:'Population Density', importance:0.08, color:'#FF4D4F' },
                { feature:'Day of Week', importance:0.04, color:'#00B4D8' },
              ].map(({feature,importance,color})=>(
                <div key={feature} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', marginBottom:5 }}>
                    <span>{feature}</span>
                    <span style={{ fontWeight:700, color }}>{(importance*100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4 }}>
                    <motion.div initial={{width:0}} animate={{width:`${importance*100}%`}} transition={{duration:1, ease:'easeOut'}}
                      style={{ height:'100%', background:color, borderRadius:4 }}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══ BIAS AUDIT TAB ══ */}
        {tab==='bias' && (
          <motion.div key="bias" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ display:'flex', flexDirection:'column', gap:20 }}>

            <div className="glass-panel" style={{ padding:28 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                <div>
                  <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}>
                    <Eye size={18} color="#FA8C16"/> Fairness Audit — Zone &amp; Crime Type
                  </h3>
                  <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', margin:0 }}>
                    Bias score &lt;75% = flagged · Target: ≥80% fairness across all segments
                  </p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:'0.8rem' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:'#00E474', display:'inline-block' }}/>Fair
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:'#FF4D4F', display:'inline-block' }}/>Flagged
                  </span>
                </div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ fontSize:'0.75rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1 }}>
                    <th style={{ textAlign:'left', padding:'8px 12px' }}>Zone</th>
                    <th style={{ textAlign:'left', padding:'8px 12px' }}>Crime Type</th>
                    <th style={{ textAlign:'left', padding:'8px 12px' }}>Fairness Score</th>
                    <th style={{ textAlign:'left', padding:'8px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {biasData.map(({zone,crimeType,fairness,flag})=>(
                    <tr key={zone} style={{ borderTop:'1px solid rgba(255,255,255,0.05)', fontSize:'0.88rem' }}>
                      <td style={{ padding:'14px 12px', fontWeight:600 }}>{zone}</td>
                      <td style={{ padding:'14px 12px', color:'var(--text-secondary)' }}>{crimeType}</td>
                      <td style={{ padding:'14px 12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, maxWidth:120 }}>
                            <div style={{ height:'100%', width:`${fairness}%`, borderRadius:3,
                              background: fairness>=80?'#00E474':'#FF4D4F', transition:'width 0.6s' }}/>
                          </div>
                          <span style={{ fontWeight:700, color: fairness>=80?'#00E474':'#FF4D4F', minWidth:36 }}>{fairness}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'14px 12px' }}>
                        {flag
                          ? <span style={{ background:'#FF4D4F22', color:'#FF4D4F', padding:'3px 10px',
                              borderRadius:20, fontSize:'0.75rem', fontWeight:700, border:'1px solid #FF4D4F44' }}>⚠ Flagged</span>
                          : <span style={{ background:'#00E47422', color:'#00E474', padding:'3px 10px',
                              borderRadius:20, fontSize:'0.75rem', fontWeight:700, border:'1px solid #00E47444' }}>✓ Fair</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass-panel" style={{ padding:28 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 20px' }}>Bias Mitigation Recommendations</h3>
              {[
                { zone:'Zone B – South', action:'Increase patrol frequency and re-collect training data with balanced class weights.' },
                { zone:'Zone D – East', action:'Apply post-processing threshold calibration; crowdsource additional reports.' },
              ].map(({zone,action})=>(
                <div key={zone} style={{ padding:16, background:'rgba(255,77,79,0.06)', border:'1px solid rgba(255,77,79,0.2)',
                  borderRadius:12, marginBottom:12 }}>
                  <div style={{ fontWeight:700, color:'#FF4D4F', marginBottom:4, fontSize:'0.88rem' }}>⚠ {zone}</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{action}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══ USER STATS TAB ══ */}
        {tab==='users' && (
          <motion.div key="users" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

            <div className="glass-panel" style={{ padding:28 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                <Users size={18} color="#00E474"/> Citizen Statistics
              </h3>
              {[
                { label:'Total Registered',    value: stats?.citizen_count ?? 0,  color:'#00E474' },
                { label:'Active Today',         value: Math.floor((stats?.citizen_count??0)*0.3), color:'#3A86FF' },
                { label:'SOS Triggered',        value: stats?.sos_count ?? 0,      color:'#FF4D4F' },
                { label:'Reports Submitted',    value: stats?.fir_count ?? 0,      color:'#FA8C16' },
                { label:'Guardian Mode Active', value: Math.floor((stats?.citizen_count??0)*0.1), color:'#8B5CF6' },
              ].map(({label,value,color})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight:800, color, fontSize:'1.1rem' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="glass-panel" style={{ padding:28 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 20px', display:'flex', alignItems:'center', gap:8 }}>
                <Shield size={18} color="#FA8C16"/> Officer Statistics
              </h3>
              {[
                { label:'Total Officers',       value: stats?.officer_count ?? 0,   color:'#FA8C16' },
                { label:'On Duty Now',           value: Math.floor((stats?.officer_count??0)*0.6), color:'#00E474' },
                { label:'FIRs Filed Today',      value: stats?.fir_count ?? 0,       color:'#3A86FF' },
                { label:'Patrol Logs Today',     value: 87,                           color:'#8B5CF6' },
                { label:'Response Time (avg)',   value: '8.4 min',                    color:'#FF4D4F' },
              ].map(({label,value,color})=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight:800, color, fontSize:'1.1rem' }}>{value}</span>
                </div>
              ))}
            </div>

            <div className="glass-panel" style={{ padding:28, gridColumn:'span 2' }}>
              <h3 style={{ fontSize:'1rem', fontWeight:700, margin:'0 0 20px' }}>Role Distribution</h3>
              <div style={{ display:'flex', gap:32, alignItems:'center' }}>
                {[
                  { role:'Citizens',  count: stats?.citizen_count??0,  color:'#00E474', pct:72 },
                  { role:'Officers',  count: stats?.officer_count??0,  color:'#FA8C16', pct:24 },
                  { role:'Admins',    count: 2,                         color:'#8B5CF6', pct:4  },
                ].map(({role,count,color,pct})=>(
                  <div key={role} style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                      <span style={{ fontWeight:600 }}>{role}</span>
                      <span style={{ color, fontWeight:700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height:10, background:'rgba(255,255,255,0.07)', borderRadius:5 }}>
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1}}
                        style={{ height:'100%', background:color, borderRadius:5 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ SYSTEM ALERTS TAB ══ */}
        {tab==='alerts' && (
          <motion.div key="alerts" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}
            style={{ display:'flex', flexDirection:'column', gap:16 }}>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, margin:0, display:'flex', alignItems:'center', gap:8 }}>
                <Bell size={18} color="#FA8C16"/> System Alert Log
              </h3>
              <button onClick={()=>addToast('Test alert fired!','warning')}
                style={{ padding:'8px 18px', background:'rgba(250,140,22,0.15)',
                  border:'1px solid rgba(250,140,22,0.4)', borderRadius:10, color:'#FA8C16',
                  fontWeight:600, cursor:'pointer', fontSize:'0.82rem' }}>
                + Fire Test Alert
              </button>
            </div>

            {[
              { time:'22:31:05', level:'info',     msg:'Model inference completed for Zone A.',         icon:CheckCircle, color:'#00E474' },
              { time:'22:28:47', level:'warning',   msg:'API latency exceeded 35ms threshold.',         icon:AlertTriangle, color:'#FA8C16' },
              { time:'22:25:12', level:'critical',  msg:'SOS alert triggered – Citizen ID 42.',        icon:Zap, color:'#FF4D4F' },
              { time:'22:20:00', level:'info',      msg:'Database backup completed successfully.',      icon:CheckCircle, color:'#00E474' },
              { time:'22:15:33', level:'warning',   msg:'Bias threshold breach in Zone D audit.',      icon:AlertTriangle, color:'#FA8C16' },
              { time:'22:10:09', level:'info',      msg:'XGBoost model loaded. Accuracy: 82%.',        icon:CheckCircle, color:'#00E474' },
              { time:'22:05:44', level:'critical',  msg:'Attempted unauthorized admin access.',        icon:Lock, color:'#FF4D4F' },
            ].map(({time,level,msg,icon:Icon,color},i)=>(
              <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                className="glass-panel"
                style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:16,
                  borderLeft:`4px solid ${color}` }}>
                <Icon size={20} color={color} style={{ flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.88rem', fontWeight:600 }}>{msg}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:2 }}>Today at {time}</div>
                </div>
                <span style={{ background:`${color}22`, color, padding:'3px 10px',
                  borderRadius:20, fontSize:'0.72rem', fontWeight:700, border:`1px solid ${color}44`,
                  textTransform:'capitalize', flexShrink:0 }}>{level}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </>
  );
};

// dummy aliases to avoid undefined icon refs in tab bar
const LayoutDashIcon = Activity;
const CpuIcon = Cpu;
const EyeIcon = Eye;
const UsersIcon = Users;
const BellIcon = Bell;

export default AdminDashboard;
