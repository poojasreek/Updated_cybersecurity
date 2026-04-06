import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, Activity, BrainCircuit, Search, 
  FileText, Fingerprint
} from 'lucide-react';
import { offenderRecords } from '../data/mockData';

const riskColor = { Low: '#2ECC71', Medium: '#FFD60A', High: '#FF4D4F' };

export default function BehavioralAnalysisPage() {
  const [selectedOffender, setSelectedOffender] = useState(offenderRecords[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/crime-search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header with Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
            <BrainCircuit size={14}/> AI PREDICTIVE JUSTICE MODULE
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Behavioral Risk Analysis</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Predicting recidivism and identifying behavioral patterns.
          </p>
        </div>

        {/* Global Crime Search Input */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search crime (e.g. Theft, Assault)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px',
              border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.3)',
              color: 'white', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button type="submit" style={{ display: 'none' }}>Search</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(400px, 2fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Offender Records */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fingerprint size={18} color="var(--primary-color)"/> Case Profiles
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Recent records flagged for assessment</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {offenderRecords.map(record => {
              const isSelected = selectedOffender.id === record.id;
              const rc = riskColor[record.riskLevel];
              
              return (
                <div 
                  key={record.id} 
                  onClick={() => setSelectedOffender(record)}
                  style={{ 
                    padding: '16px 20px', borderBottom: '1px solid var(--border-color)', 
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: isSelected ? 'rgba(58,134,255,0.08)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? rc : 'transparent'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.95rem' }}>{record.name}</span>
                    <span style={{ fontSize: '0.65rem', background: `rgba(${rc === '#FF4D4F'?'255,77,79':rc==='#FFD60A'?'255,214,10':'46,204,113'}, 0.15)`, color: rc, padding: '3px 8px', borderRadius: '12px', fontWeight: '900' }}>
                      {record.riskScore}% RISK
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{record.id}</span>
                    <span>{record.history.length} Offenses</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Panel: Profile & Risk */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedOffender.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle, ${riskColor[selectedOffender.riskLevel]}22 0%, transparent 70%)` }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={30} color={riskColor[selectedOffender.riskLevel]} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 4px' }}>{selectedOffender.name}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>ID: {selectedOffender.id} &nbsp;·&nbsp; Age: {selectedOffender.age}</p>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', margin: '0 0 4px', letterSpacing: '1px' }}>REOFFEND RISK</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, color: riskColor[selectedOffender.riskLevel] }}>{selectedOffender.riskScore}%</h3>
                    <div style={{ background: `rgba(${riskColor[selectedOffender.riskLevel] === '#FF4D4F'?'255,77,79':riskColor[selectedOffender.riskLevel]==='#FFD60A'?'255,214,10':'46,204,113'}, 0.1)`, border: `1px solid ${riskColor[selectedOffender.riskLevel]}44`, color: riskColor[selectedOffender.riskLevel], padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {selectedOffender.riskLevel.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavioral Pattern Analysis */}
              <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <FileText size={16}/> Crime History & Frequency
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: '0 0 12px', fontSize: '0.85rem' }}>
                    {selectedOffender.history.map((h, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>{h}</li>
                    ))}
                  </ul>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <strong style={{ color: '#3A86FF' }}>Velocity:</strong> {selectedOffender.frequency}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Activity size={16}/> Behavioral Pattern
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    {selectedOffender.pattern}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
