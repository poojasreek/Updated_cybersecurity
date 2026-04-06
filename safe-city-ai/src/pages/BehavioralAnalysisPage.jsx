import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Activity, ShieldAlert, BrainCircuit, AlertTriangle, 
  CheckCircle, ListChecks, HeartHandshake, Scale, ShieldCheck, 
  MapPin, Clock, FileText, Fingerprint
} from 'lucide-react';

// Mock data for behavioral analysis
const offenderRecords = [
  {
    id: 'OFF-1042',
    name: 'Rajesh Kumar',
    age: 24,
    history: ['Petty Theft (2023)', 'Shoplifting (2024)', 'Vandalism (2025)'],
    frequency: 'Increasing (3 incidents in 2 years)',
    pattern: 'Opportunistic property crimes in commercial zones during evening hours.',
    riskScore: 68,
    riskLevel: 'Medium',
    biasScore: 98, // 98% fair
    recommendations: [
      { type: 'Rehabilitation', desc: 'Mandatory vocational training program (6 months).' },
      { type: 'Community Monitoring', desc: 'Weekly check-ins with assigned community officer.' },
      { type: 'Restorative Justice', desc: 'Community service (120 hours) in affected commercial areas.' }
    ]
  },
  {
    id: 'OFF-2199',
    name: 'Vikram Singh',
    age: 35,
    history: ['Assault (2020)', 'Aggravated Assault (2022)', 'Armed Robbery (2024)'],
    frequency: 'Escalating severity',
    pattern: 'Violent offenses primarily late at night in isolated areas.',
    riskScore: 89,
    riskLevel: 'High',
    biasScore: 96,
    recommendations: [
      { type: 'Correctional Facility', desc: 'Traditional imprisonment required due to public safety risk.' },
      { type: 'Psychiatric Eval', desc: 'Mandatory behavioral and anger management evaluation.' },
      { type: 'Strict Monitoring', desc: 'Electronic ankle monitoring post-release.' }
    ]
  },
  {
    id: 'OFF-0831',
    name: 'Arun Prakash',
    age: 19,
    history: ['Cyber Harassment (2025)'],
    frequency: 'First-time offense',
    pattern: 'Online harassment related to peer disputes.',
    riskScore: 24,
    riskLevel: 'Low',
    biasScore: 99,
    recommendations: [
      { type: 'Counseling', desc: 'Digital ethics and empathy counseling (8 sessions).' },
      { type: 'Warning', desc: 'Formal youth caution.' },
      { type: 'Digital Monitoring', desc: 'Restrictions and monitoring of social media usage.' }
    ]
  },
  {
    id: 'OFF-3412',
    name: 'Deepa Krishnan',
    age: 28,
    history: ['Substance Possession (2022)', 'Substance Possession (2024)'],
    frequency: 'Repeated non-violent',
    pattern: 'Substance abuse related incidents, no indication of distribution.',
    riskScore: 45,
    riskLevel: 'Medium',
    biasScore: 97,
    recommendations: [
      { type: 'Rehabilitation', desc: 'In-patient drug rehabilitation facility (90 days).' },
      { type: 'Support Group', desc: 'Mandatory attendance at community support groups.' },
      { type: 'Alternative Sentencing', desc: 'Suspended sentence contingent on clean drug tests.' }
    ]
  }
];

const riskColor = { Low: '#2ECC71', Medium: '#FFD60A', High: '#FF4D4F' };

export default function BehavioralAnalysisPage() {
  const [selectedOffender, setSelectedOffender] = useState(offenderRecords[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A855F7', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
          <BrainCircuit size={14}/> AI PREDICTIVE JUSTICE MODULE
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Behavioral Risk Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Predicting recidivism and recommending ethical alternatives to imprisonment using behavioral AI.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
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
              <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
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
