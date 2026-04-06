import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Map as MapIcon, 
  AlertCircle,
  Clock,
  MapPin,
  CarFront,
  Navigation,
  CheckCircle2,
  Bell,
  Loader2,
  TrendingUp,
  Database
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardStats, sosAlerts, crimeZones } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Patrol Units
const activePatrols = [
  { id: 'Unit-01', location: 'T. Nagar', status: 'Patrolling', officer: 'Kumar S.', distance: '1.2 km' },
  { id: 'Unit-04', location: 'Anna Nagar', status: 'Responding', officer: 'Raj M.', distance: '3.4 km' },
  { id: 'Unit-07', location: 'OMR Road', status: 'Available', officer: 'Anita R.', distance: '5.1 km' },
  { id: 'Unit-12', location: 'Adyar', status: 'Patrolling', officer: 'Vikram T.', distance: '2.8 km' },
];

const PoliceDashboard = () => {
  const [timePeriod, setTimePeriod] = useState('daily');
  const [realFirs, setRealFirs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRealRecords = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8888/api/firs');
        const data = await response.json();
        setRealFirs(data.data || []);
      } catch (err) {
        console.error("Dashboard failed to fetch live records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealRecords();
    const interval = setInterval(fetchRealRecords, 10000); // Polling for LIVE feeling
    return () => clearInterval(interval);
  }, []);

  // Process Live Data for Statistics
  const processedChartData = useMemo(() => {
    // Start with Baseline Mock Data
    const baseline = JSON.parse(JSON.stringify(timePeriod === 'daily' ? dashboardStats.dailyCrimes 
                   : timePeriod === 'weekly' ? [
                       { day: 'Week 1', count: 85 }, { day: 'Week 2', count: 64 },
                       { day: 'Week 3', count: 91 }, { day: 'Week 4', count: 72 }
                     ]
                   : dashboardStats.monthlyCrimes));

    // Map real-time FIRs into the periods
    realFirs.forEach(fir => {
      const date = new Date(fir.timestamp || fir.Date_Time);
      if (timePeriod === 'daily') {
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const target = baseline.find(d => d.day === dayStr);
        if (target) target.count += 1;
      } else if (timePeriod === 'monthly') {
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        const target = baseline.find(m => m.month === monthStr);
        if (target) target.count += 1;
      } else {
        // Simple weekly logic for demo
        baseline[baseline.length - 1].count += 1;
      }
    });

    return baseline;
  }, [realFirs, timePeriod]);

  // Process Live Data for Hotspots
  const dynamicHotspots = useMemo(() => {
    const baselineZones = JSON.parse(JSON.stringify(crimeZones));
    
    // Increment frequencies based on FIR branch/location
    realFirs.forEach(fir => {
      const loc = fir.branch_name || fir.Police_Station || '';
      const zone = baselineZones.find(z => loc.toLowerCase().includes(z.name.toLowerCase()));
      if (zone) {
        zone.crimeCount += 1;
        zone.riskScore = Math.min(100, zone.riskScore + 5); // Increase risk per new incident
      }
    });

    return baselineZones.filter(zone => zone.riskScore >= 60)
                     .sort((a,b) => b.riskScore - a.riskScore)
                     .slice(0, 4);
  }, [realFirs]);

  const xAxisKey = timePeriod === 'daily' ? 'day' : (timePeriod === 'weekly' ? 'day' : 'month');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
              <Shield size={14}/> COMMAND CENTER PROTOCOL v4.2
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Strategic Operations</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Synchronized with <strong style={{ color: '#2ECC71' }}>Secure Ledger Database</strong></p>
         </div>

         {/* Total Registered Stat Tile */}
         <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(58, 134, 255, 0.05)', border: '1px solid rgba(58, 134, 255, 0.2)' }}>
            <div style={{ padding: '10px', background: 'rgba(58, 134, 255, 0.15)', borderRadius: '12px' }}><Database size={20} color="var(--primary-color)" /></div>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px' }}>TOTAL REGISTERED FIRs</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '900' }}>{realFirs.length}</span>
                <span style={{ fontSize: '0.75rem', color: '#2ECC71', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}><TrendingUp size={14}/> +{realFirs.length > 0 ? 'Live' : '0'}</span>
              </div>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
        
        {/* Crime Statistics (Dynamic) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {isLoading && (
            <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <Loader2 className="animate-spin" size={16} color="var(--primary-color)" />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Crime Analytics</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trend processing of ledger-verified incidents</p>
            </div>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px' }}>
               {['daily', 'weekly', 'monthly'].map(period => (
                 <button 
                   key={period}
                   onClick={() => setTimePeriod(period)}
                   style={{ 
                     padding: '6px 14px', 
                     borderRadius: '6px', 
                     background: timePeriod === period ? 'var(--panel-bg)' : 'transparent', 
                     border: timePeriod === period ? '1px solid rgba(255,255,255,0.1)' : 'none',
                     color: timePeriod === period ? 'white' : 'var(--text-secondary)',
                     fontSize: '0.75rem', 
                     fontWeight: '700',
                     textTransform: 'uppercase',
                     cursor: 'pointer',
                     transition: 'all 0.2s',
                     letterSpacing: '1px'
                   }}>
                     {period}
                 </button>
               ))}
            </div>
          </div>
          <div style={{ height: '300px', width: '100%', marginTop: 'auto' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCrime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(11, 19, 43, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'white', fontSize: '0.8rem', fontWeight: '700' }}
                  cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorCrime)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotspot Areas (Dynamic) */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <MapIcon size={20} color="#FF4D4F" /> High-Risk zones
             </h2>
             <button style={{ 
               fontSize: '0.65rem', color: 'black', background: '#FFD60A', border: 'none', 
               cursor: 'pointer', fontWeight: '900', padding: '8px 16px', borderRadius: '12px', letterSpacing: '1px'
             }}>
               ALERT CITIZENS
             </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
             <AnimatePresence>
               {dynamicHotspots.map((zone, idx) => (
                 <motion.div 
                   key={zone.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   layout
                   transition={{ delay: idx * 0.05 }}
                   style={{ 
                     padding: '16px', 
                     background: 'rgba(255, 77, 79, 0.03)', 
                     borderRadius: '16px',
                     border: '1px solid rgba(255, 77, 79, 0.1)',
                     borderLeft: `5px solid ${zone.riskScore > 80 ? '#FF4D4F' : '#FFD60A'}`,
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center'
                   }}
                 >
                   <div>
                     <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '4px' }}>{zone.name}</h3>
                     <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}><AlertCircle size={12}/> {zone.crimeCount} INFRACTIONS</span>
                       <span style={{ fontWeight: '600' }}>DOMINANT: {zone.dominantCrime.toUpperCase()}</span>
                     </div>
                   </div>
                   <div style={{ 
                     width: '44px', height: '44px', borderRadius: '12px', 
                     background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                     fontWeight: '900', color: zone.riskScore > 80 ? '#FF4D4F' : '#FFD60A',
                     border: `1px solid ${zone.riskScore > 80 ? 'rgba(255,77,79,0.3)' : 'rgba(255,214,10,0.3)'}`
                   }}>
                     {zone.riskScore}
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        </div>

        {/* SOS Feed */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Bell size={20} color="#FFD60A" /> Active Emergency Feed
             </h2>
             <span style={{ 
               padding: '4px 10px', 
               background: 'rgba(255,77,79,0.15)', 
               color: '#FF4D4F', 
               borderRadius: '8px', 
               fontSize: '0.65rem', 
               fontWeight: '900',
               letterSpacing: '1px'
             }}>LOCATING...</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {sosAlerts.slice(0,4).map((sos, idx) => (
                <motion.div 
                  key={sos.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                   <div style={{
                     width: '48px',
                     height: '48px',
                     borderRadius: '14px',
                     background: sos.status === 'active' ? 'rgba(255,77,79,0.15)' : 'rgba(58,134,255,0.15)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}>
                     <Shield size={24} color={sos.status === 'active' ? "#FF4D4F" : "#3A86FF"} />
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                       <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{sos.type.toUpperCase()} ALERT</span>
                       <span style={{ fontSize: '0.65rem', color: sos.status === 'active' ? '#FF4D4F' : '#3A86FF', fontWeight: '900', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{sos.status.toUpperCase()}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {sos.location}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {sos.time}</span>
                     </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Patrol Logistics */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <CarFront size={20} color="#3A86FF" /> Patrol Asset Management
             </h2>
             <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>DEPLOYED: {activePatrols.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {activePatrols.map((unit, idx) => (
               <motion.div 
                 key={unit.id}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 style={{ 
                   padding: '16px', 
                   background: 'rgba(255,255,255,0.02)', 
                   borderRadius: '16px',
                   border: '1px solid rgba(255,255,255,0.05)',
                   display: 'grid',
                   gridTemplateColumns: 'auto 1fr auto',
                   alignItems: 'center',
                   gap: '16px'
                 }}
               >
                 <div style={{
                   width: '40px', height: '40px', borderRadius: '12px', 
                   background: 'rgba(58,134,255,0.1)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                   <CarFront size={20} color="#3A86FF" />
                 </div>
                 
                 <div>
                   <h3 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '4px' }}>{unit.id} <span style={{ opacity: 0.4 }}>•</span> {unit.officer}</h3>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                     <Navigation size={12} /> {unit.location}
                   </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                   <span style={{ 
                     padding: '4px 12px', 
                     borderRadius: '6px', 
                     fontSize: '0.65rem', 
                     fontWeight: '900',
                     background: unit.status === 'Responding' ? 'rgba(255,77,79,0.1)' 
                                : unit.status === 'Available' ? 'rgba(46,204,113,0.1)' 
                                : 'rgba(255,214,10,0.1)',
                     color: unit.status === 'Responding' ? '#FF4D4F' 
                          : unit.status === 'Available' ? '#2ECC71' 
                          : '#FFD60A'
                   }}>
                     {unit.status.toUpperCase()}
                   </span>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PoliceDashboard;
;
