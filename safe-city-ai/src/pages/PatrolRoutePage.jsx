import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Navigation, Clock, Shield, CheckCircle, Activity, Cpu } from 'lucide-react';

const PatrolRoutePage = () => {
  const [officerId, setOfficerId] = useState(1);
  const [startHour, setStartHour] = useState(20);
  const [endHour, setEndHour] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [routePlan, setRoutePlan] = useState(null);

  const generateRoute = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8888/api/patrol/generate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_id: parseInt(officerId),
          shift_start_hours: parseInt(startHour),
          shift_end_hours: parseInt(endHour)
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        setRoutePlan(data.route);
      }
    } catch (error) {
      console.error("Failed to generate route:", error);
    }
    setIsLoading(false);
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>AI Patrol Route Generator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Powered by Reinforcement Learning (PPO Agent)</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Input Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--primary-color)" /> Configuration
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Officer ID</label>
            <input 
              type="number" 
              value={officerId} 
              onChange={(e) => setOfficerId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                color: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shift Start (Hour)</label>
              <input 
                type="number" 
                value={startHour} 
                onChange={(e) => setStartHour(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: 'white'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Shift End (Hour)</label>
              <input 
                type="number" 
                value={endHour} 
                onChange={(e) => setEndHour(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <button 
            onClick={generateRoute}
            disabled={isLoading}
            style={{
              marginTop: '12px',
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3A86FF 0%, #2A66CA 100%)',
              color: 'white',
              border: 'none',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
          >
            {isLoading ? <Activity size={20} className="animate-spin" /> : <Cpu size={20} />}
            {isLoading ? 'Optimizing Route...' : 'Generate Optimal Route'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={20} color="#2ECC71" /> Generated Path Layout
          </h2>

          {!routePlan && !isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: 0.5 }}>
              <MapIcon size={48} style={{ marginBottom: '16px' }} />
              <p>No route generated yet. Configure shift and click generate.</p>
            </div>
          )}

          {routePlan && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '20px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(58, 134, 255, 0.3)', zIndex: 0 }}></div>
              
              {routePlan.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  style={{ display: 'flex', gap: '24px', padding: '16px 0', position: 'relative', zIndex: 1 }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: step.risk_level === 'Red' ? '#1C2541' : '#1C2541',
                    border: `2px solid ${step.risk_level === 'Red' ? '#FF4D4F' : '#FFD60A'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 15px ${step.risk_level === 'Red' ? 'rgba(255,77,79,0.3)' : 'rgba(255,214,10,0.3)'}`
                  }}>
                    <CheckCircle size={18} color={step.risk_level === 'Red' ? '#FF4D4F' : '#FFD60A'} />
                  </div>
                  
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>#{step.order} {step.zone_name}</h3>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: step.risk_level === 'Red' ? 'rgba(255,77,79,0.1)' : 'rgba(255,214,10,0.1)',
                        color: step.risk_level === 'Red' ? '#FF4D4F' : '#FFD60A',
                        fontWeight: '700'
                      }}>{step.risk_level} Priority</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>{formatTime(step.start_time)} - {formatTime(step.end_time)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapIcon size={14} />
                        <span>({step.target_lat.toFixed(4)}, {step.target_lng.toFixed(4)})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatrolRoutePage;
