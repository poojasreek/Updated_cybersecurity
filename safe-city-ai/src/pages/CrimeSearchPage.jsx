import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, ArrowLeft, UserX, FileText } from 'lucide-react';
import { offenderRecords } from '../data/mockData';

export default function CrimeSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  // Filter offenders whose history contains the queried crime (case-insensitive)
  const matches = useMemo(() => {
    if (!query) return [];
    const qLower = query.toLowerCase();
    return offenderRecords.filter(offender => 
      offender.history.some(crime => crime.toLowerCase().includes(qLower))
    );
  }, [query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button 
          onClick={() => navigate('/behavioral-analysis')} 
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={22} color="var(--primary-color)" /> Crime Query Results
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
             Showing individuals linked to: <strong style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>"{query}"</strong>
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,77,79,0.05)', border: '1px dashed rgba(255,77,79,0.3)', borderRadius: '16px' }}>
          <UserX size={48} color="#FF4D4F" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 8px', color: '#FF4D4F' }}>No Records Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>We couldn't find any offenders matching the crime "{query}".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {matches.map(record => {
            const riskColor = record.riskLevel === 'High' ? '#FF4D4F' : record.riskLevel === 'Medium' ? '#FFD60A' : '#2ECC71';
            
            return (
              <div key={record.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `4px solid ${riskColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: '0 0 4px' }}>{record.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>ID: {record.id} • Age: {record.age}</p>
                  </div>
                  <div style={{ background: `rgba(${riskColor === '#FF4D4F'?'255,77,79':riskColor==='#FFD60A'?'255,214,10':'46,204,113'}, 0.15)`, color: riskColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                    {record.riskScore}% RISK
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} color="#FFD60A" /> Matched Offenses
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                    {record.history
                      .filter(crime => crime.toLowerCase().includes(query.toLowerCase()))
                      .map((crime, idx) => (
                        <li key={idx} style={{ marginBottom: '4px', color: 'white' }}>
                          {/* Highlighting the matched word */}
                          {crime.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === query.toLowerCase() 
                              ? <span key={i} style={{ color: '#FFD60A', fontWeight: 'bold' }}>{part}</span> 
                              : part
                          )}
                        </li>
                      ))}
                  </ul>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: 'auto' }}>
                  <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                  <span>{record.pattern}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
