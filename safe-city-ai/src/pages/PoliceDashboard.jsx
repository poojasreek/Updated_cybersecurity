import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Users, 
  Activity, 
  TrendingUp, 
  Map as MapIcon, 
  AlertCircle,
  Plus,
  Filter,
  Download,
  MoreVertical,
  ChevronRight,
  Clock,
  MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { dashboardStats, firRecords, crimeTypes, statusTypes } from '../data/mockData';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const PoliceDashboard = () => {
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddFIR, setShowAddFIR] = useState(false);

  const filteredFIRs = firRecords.filter(f => 
    (filterType === 'All' || f.crimeType === filterType) &&
    (filterStatus === 'All' || f.status === filterStatus)
  ).slice(0, 6); // Just show top 6 in dashboard

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("SAFE-CITY AI: FIR REPORT", 14, 15);
    doc.autoTable({
      head: [['FIR ID', 'Crime Type', 'Location', 'Date', 'Status']],
      body: firRecords.map(f => [f.id, f.crimeType, f.location, f.date, f.status]),
      startY: 20
    });
    doc.save("fir_report.pdf");
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '200px',
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '60px',
        height: '60px',
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        borderRadius: '50%'
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{
           width: '44px',
           height: '44px',
           borderRadius: '12px',
           background: `${color}22`,
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           border: `1px solid ${color}44`
         }}>
           <Icon size={24} color={color} />
         </div>
         <span style={{ 
           fontSize: '0.75rem', 
           fontWeight: '700', 
           padding: '4px 8px', 
           borderRadius: '6px', 
           background: trend > 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 77, 79, 0.1)',
           color: trend > 0 ? '#2ECC71' : '#FF4D4F',
           display: 'flex',
           alignItems: 'center',
           gap: '4px'
         }}>
           {trend > 0 ? '+' : ''}{trend}%
         </span>
      </div>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</p>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* KPI Stats Section */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <StatCard title="Total FIRs" value={dashboardStats.totalFIRs} icon={FileText} color="#3A86FF" trend={12} />
        <StatCard title="Open Cases" value={dashboardStats.openCases} icon={AlertCircle} color="#FFD60A" trend={-5} />
        <StatCard title="Resolved" value={dashboardStats.resolvedCases} icon={Shield} color="#2ECC71" trend={18} />
        <StatCard title="SOS Alerts" value={dashboardStats.sosAlerts} icon={Activity} color="#FF4D4F" trend={24} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Module 1: FIR Management Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div>
               <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>Recent FIR Records</h2>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: Active Units in 4 Zones</p>
             </div>
             <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    background: 'var(--panel-bg)', 
                    color: 'white', 
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                   }}
                >
                  {crimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={exportPDF} style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--panel-bg)',
                  border: '1px solid var(--border-color)'
                }}>
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setShowAddFIR(true)}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                >
                  <Plus size={18} /> FIR
                </button>
             </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ID / Type</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Location</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFIRs.map((fir, idx) => (
                  <motion.tr 
                    key={fir.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '2px' }}>{fir.id}</p>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: fir.severity === 'high' ? 'rgba(255,77,79,0.1)' : 'rgba(58,134,255,0.1)',
                        color: fir.severity === 'high' ? '#FF4D4F' : '#3A86FF',
                        fontWeight: '700'
                      }}>{fir.crimeType}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.85rem' }}>{fir.location}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{fir.date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fir.time}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        color: fir.status === 'Resolved' ? '#2ECC71' : fir.status === 'Open' ? '#FFD60A' : '#3A86FF'
                      }}>{fir.status}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                       <button style={{ 
                         padding: '4px', 
                         borderRadius: '6px', 
                         background: 'rgba(0,0,0,0.2)',
                         border: '1px solid var(--border-color)',
                         color: 'var(--text-secondary)'
                       }}>
                         <ChevronRight size={18} />
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            background: 'rgba(58,134,255,0.05)',
            borderRadius: '10px',
            border: '1px dashed var(--primary-color)',
            color: 'var(--primary-color)',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>View All 156 Records</button>
        </div>

        {/* Charts & Map Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Crime Distribution Chart */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px' }}>Crime Distribution</h2>
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardStats.crimeTypeDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardStats.crimeTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#1C2541', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
              {dashboardStats.crimeTypeDistribution.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', marginLeft: 'auto' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time SOS Alerts */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>Active SOS Alerts</h2>
               <span style={{ 
                 padding: '2px 8px', 
                 background: 'rgba(255,77,79,0.1)', 
                 color: '#FF4D4F', 
                 borderRadius: '4px', 
                 fontSize: '0.7rem', 
                 fontWeight: '700',
                 animation: 'pulse 2s infinite'
               }}>LIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {[{ id: 101, area: 'Anna Nagar', time: '2m', type: 'Panic' }, { id: 102, area: 'T. Nagar', time: '5m', type: 'Medical' }].map(sos => (
                 <div key={sos.id} style={{
                   padding: '12px',
                   background: 'rgba(255,77,79,0.05)',
                   borderRadius: '12px',
                   border: '1px solid rgba(255,77,79,0.1)',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '12px'
                 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(255,77,79,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Shield size={20} color="#FF4D4F" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{sos.area} - {sos.type}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Received {sos.time} ago</span>
                      </div>
                    </div>
                    <button style={{
                       marginLeft: 'auto',
                       padding: '6px 12px',
                       borderRadius: '8px',
                       background: '#FF4D4F',
                       color: 'white',
                       fontSize: '0.75rem',
                       fontWeight: '700'
                    }}>Deploy</button>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>

      {/* Module 2: Crime Trends Area Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Week / Month Trend Analysis</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aggregated data from all active surveillance nodes</p>
          </div>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '4px' }}>
             <button style={{ padding: '6px 16px', borderRadius: '6px', background: 'var(--panel-bg)', fontSize: '0.8rem', fontWeight: '600' }}>Week</button>
             <button style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Month</button>
          </div>
        </div>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboardStats.dailyCrimes}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3A86FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3A86FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ background: '#1C2541', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                itemStyle={{ color: 'white' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3A86FF" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 3D Visual Floating Card Effect for Stats Overview */}
      <div style={{ display: 'flex', gap: '20px' }}>
         {['Active Patrols', 'Nodes Online', 'Blockchain Hash'].map((label, idx) => (
           <motion.div 
             key={label}
             whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
             className="glass-panel" 
             style={{ 
               flex: 1, 
               padding: '20px', 
               background: 'linear-gradient(135deg, rgba(58,134,255,0.05) 0%, rgba(28,37,65,0.5) 100%)',
               textAlign: 'center',
               transform: 'perspective(1000px)'
             }}
           >
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>{label}</p>
             <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{idx === 0 ? '12/15' : idx === 1 ? '1,248' : '0x8f2...ae4'}</h4>
           </motion.div>
         ))}
      </div>

    </div>
  );
};

export default PoliceDashboard;
