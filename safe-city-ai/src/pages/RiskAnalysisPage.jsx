import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, MapPin, Clock, CalendarDays,
  Target, AlertTriangle, TrafficCone, FileText, CheckCircle
} from 'lucide-react';
import { crimeZones, sosAlerts, dashboardStats } from '../data/mockData';

const RiskAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // --- 1. Risk Zone Classification ---
  const categorizedZones = useMemo(() => {
    const high = [];
    const medium = [];
    const low = [];
    
    crimeZones.forEach(zone => {
      // Logic matching existing models
      if (zone.riskScore >= 70) high.push(zone);
      else if (zone.riskScore >= 40) medium.push(zone);
      else low.push(zone);
    });

    return { high: high.sort((a,b)=>b.riskScore - a.riskScore), medium, low };
  }, []);

  // --- 2. SOS Pattern Analyzer ---
  const sosPatterns = useMemo(() => {
    // We group SOS by location to find out frequent emergency locations
    const locationmap = {};
    sosAlerts.forEach(sos => {
      if(!locationmap[sos.location]) locationmap[sos.location] = {count:0, types:[]};
      locationmap[sos.location].count += 1;
      if(!locationmap[sos.location].types.includes(sos.type)) locationmap[sos.location].types.push(sos.type);
    });
    
    return Object.entries(locationmap).map(([loc, data]) => ({
      location: loc,
      count: data.count,
      types: data.types.join(", ")
    })).sort((a, b) => b.count - a.count);
  }, []);

  // --- 3. Time-Based Patrol Scheduler ---
  const patrolSchedule = useMemo(() => {
    const schedules = [];
    const shifts = [
      { time: '20:00 - 00:00', label: 'Night Shift 1' },
      { time: '00:00 - 04:00', label: 'Night Shift 2' },
      { time: '04:00 - 08:00', label: 'Morning Shift' },
      { time: '08:00 - 16:00', label: 'Day Shift' },
      { time: '16:00 - 20:00', label: 'Evening Shift' }
    ];

    shifts.forEach((shift, idx) => {
      // Prioritize High-Risk zones (first 2) and top SOS hotspots for night shifts
      let targetZones = [];
      if (idx === 0 || idx === 1) {
         // High risk night time
         targetZones = categorizedZones.high.slice(0, 3).map(z => z.name);
         if (sosPatterns.length > 0) targetZones.push(sosPatterns[0].location);
      } else if (idx === 4) {
         // Evening shift
         targetZones = categorizedZones.high.slice(0, 2).map(z => z.name)
                         .concat(categorizedZones.medium.slice(0, 1).map(z=>z.name));
      } else {
         // Day shifts - focus on medium risk/traffic
         targetZones = categorizedZones.medium.slice(0, 3).map(z => z.name);
      }

      // Keep unique targets
      targetZones = [...new Set(targetZones)];

      schedules.push({
        ...shift,
        zones: targetZones,
        priority: (idx === 0 || idx === 1) ? 'Critical' : (idx === 4 ? 'High' : 'Normal')
      });
    });

    return schedules;
  }, [categorizedZones, sosPatterns]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD60A', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
            <Activity size={14}/> STRATEGIC RISK INTELLIGENCE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>Risk Analysis & Dispatch</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprehensive breakdown of high-risk zones, SOS hotspots, and optimized schedules.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
         <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,77,79,0.15)', borderRadius: '12px' }}><ShieldAlert size={28} color="#FF4D4F"/></div>
            <div>
               <p style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px' }}>HIGH RISK ZONES</p>
               <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FF4D4F', margin: 0 }}>{categorizedZones.high.length}</h2>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,214,10,0.15)', borderRadius: '12px' }}><AlertTriangle size={28} color="#FFD60A"/></div>
            <div>
               <p style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px' }}>SOS HOTSPOTS</p>
               <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#FFD60A', margin: 0 }}>{sosPatterns.length}</h2>
            </div>
         </div>
         <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(58,134,255,0.15)', borderRadius: '12px' }}><CalendarDays size={28} color="#3A86FF"/></div>
            <div>
               <p style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6, letterSpacing: '1px' }}>PATROL SHIFTS</p>
               <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3A86FF', margin: 0 }}>{patrolSchedule.length}</h2>
            </div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>
         
         {/* LEFT COLUMN: Risk Array & SOS History */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. Risk Zones Table */}
            <div className="glass-panel" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} color="var(--primary-color)"/> Crime Data Analysis: Zone Risk Evaluation
               </h3>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...categorizedZones.high, ...categorizedZones.medium].slice(0, 5).map((zone, idx) => {
                     const isHigh = zone.riskScore >= 70;
                     return (
                     <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                        borderLeft: `4px solid ${isHigh ? '#FF4D4F' : '#FFD60A'}`
                     }}>
                        <div>
                           <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 4px' }}>{zone.name}</h4>
                           <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Dominant: {zone.dominantCrime}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                           <div style={{ textAlign: 'center' }}>
                              <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.6, fontWeight: '800' }}>INCIDENTS</span>
                              <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{zone.crimeCount}</span>
                           </div>
                           <div style={{ textAlign: 'center' }}>
                              <span style={{ display: 'block', fontSize: '0.65rem', opacity: 0.6, fontWeight: '800' }}>RISK Lvl</span>
                              <span style={{ 
                                 padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900',
                                 background: isHigh ? 'rgba(255,77,79,0.1)' : 'rgba(255,214,10,0.1)',
                                 color: isHigh ? '#FF4D4F' : '#FFD60A'
                              }}>{isHigh ? 'HIGH' : 'MEDIUM'}</span>
                           </div>
                        </div>
                     </div>
                  )})}
               </div>
            </div>

            {/* 2. SOS History Analyzer */}
            <div className="glass-panel" style={{ padding: '24px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} color="#FFD60A"/> SOS History Analyzer
               </h3>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Frequent emergency locations detected based on citizen SOS alerts in the past 7 days.</p>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {sosPatterns.map((spot, idx) => (
                     <div key={idx} style={{ 
                        padding: '16px', background: 'rgba(255,214,10,0.05)', 
                        border: '1px solid rgba(255,214,10,0.2)', borderRadius: '12px' 
                     }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                           <MapPin size={20} color="#FFD60A"/>
                           <span style={{ background: '#FFD60A', color: 'black', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900' }}>
                              {spot.count} ALERTS
                           </span>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 4px' }}>{spot.location}</h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>Types: {spot.types}</p>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* RIGHT COLUMN: Schedule Suggestions */}
         <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#3A86FF"/> AI Patrol Route Scheduler
               </h3>
               <span style={{ fontSize: '0.65rem', background: '#3A86FF', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>AUTO-GENERATED</span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
               Prioritizing <strong style={{color:'#FF4D4F'}}>High-Risk Zones</strong> and <strong style={{color:'#FFD60A'}}>SOS Hotspots</strong> with localized time-based scheduling to optimize fleet efficiency.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {patrolSchedule.map((shift, idx) => (
                  <div key={idx} style={{ 
                     padding: '16px', border: '1px solid var(--border-color)', 
                     borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                     position: 'relative', overflow: 'hidden'
                  }}>
                     {/* Priority indicator stripe */}
                     <div style={{ 
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                        background: shift.priority === 'Critical' ? '#FF4D4F' : shift.priority === 'High' ? '#FFD60A' : '#3A86FF'
                     }}/>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingLeft: '8px' }}>
                        <div>
                           <h4 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 2px' }}>{shift.label}</h4>
                           <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12}/> {shift.time}
                           </p>
                        </div>
                        <span style={{ 
                           fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px',
                           color: shift.priority === 'Critical' ? '#FF4D4F' : shift.priority === 'High' ? '#black' : '#3A86FF',
                           background: shift.priority === 'Critical' ? 'rgba(255,77,79,0.1)' : shift.priority === 'High' ? '#FFD60A' : 'rgba(58,134,255,0.1)'
                        }}>
                           {shift.priority}
                        </span>
                     </div>
                     
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '8px' }}>
                        {shift.zones.map((zone, zidx) => (
                           <span key={zidx} style={{ 
                              background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '6px', 
                              fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex', alignItems: 'center', gap: '4px'
                           }}>
                              <MapPin size={10} color="var(--primary-color)"/> {zone}
                           </span>
                        ))}
                     </div>
                  </div>
               ))}
            </div>

            <button style={{ 
               width: '100%', marginTop: '24px', background: 'var(--primary-color)', color: 'white',
               border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800',
               cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
               transition: 'all 0.2s'
            }} onMouseOver={(e)=>e.currentTarget.style.filter='brightness(1.1)'} onMouseOut={(e)=>e.currentTarget.style.filter='brightness(1)'}>
               <CheckCircle size={18}/> DEPLOY ROUTES TO ASSETS
            </button>
         </div>

      </div>

    </div>
  );
};

export default RiskAnalysisPage;
