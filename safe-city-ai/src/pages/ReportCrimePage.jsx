import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Video, UploadCloud, MapPin, AlertCircle, 
  ShieldCheck, ShieldOff, CheckCircle2, FileVideo, Image as ImageIcon, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportCrimePage() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    crimeType: '',
    location: '',
    description: '',
    isAnonymous: false,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].slice(0, 5),
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setForm({
          crimeType: '',
          location: '',
          description: '',
          isAnonymous: false,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        });
        setFiles([]);
      }, 3000);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3A86FF', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
          <AlertCircle size={14}/> CITIZEN EMPOWERMENT PORTAL
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.5px', margin: '0 0 4px' }}>Report an Incident</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Submit a digital FIR or tip directly to the police command center. Your safety and privacy are our priority.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', padding: '40px 20px', color: '#2ECC71' }}
          >
            <CheckCircle2 size={64} style={{ marginBottom: '16px', margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 8px' }}>Incident Reported</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Your report has been securely transmitted to the nearest responding authority.</p>
            {form.isAnonymous && <p style={{ fontSize: '0.8rem', marginTop: '12px', color: '#A855F7', fontWeight: '800' }}>Your identity was protected.</p>}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Identity Options */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-secondary)' }}>REPORTING AS</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {form.isAnonymous ? (
                    <><ShieldOff size={20} color="#A855F7"/> <span style={{ fontWeight: '800', color: '#A855F7' }}>Anonymous Citizen</span></>
                  ) : (
                    <><ShieldCheck size={20} color="#2ECC71"/> <span style={{ fontWeight: '800', color: '#2ECC71' }}>{user?.name || 'Verified Citizen'}</span></>
                  )}
                </div>
              </div>
              
              <div 
                onClick={() => setForm({...form, isAnonymous: !form.isAnonymous})}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px',
                  background: form.isAnonymous ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${form.isAnonymous ? '#A855F7' : 'var(--border-color)'}`, transition: 'all 0.3s'
                }}
              >
                <div style={{ 
                  width: '40px', height: '22px', borderRadius: '11px', background: form.isAnonymous ? '#A855F7' : 'rgba(255,255,255,0.2)', position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', top: '2px', left: form.isAnonymous ? '20px' : '2px', width: '18px', height: '18px', 
                    borderRadius: '50%', background: 'white', transition: 'left 0.3s' 
                  }}/>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: form.isAnonymous ? '800' : '600' }}>Stay Anonymous</span>
              </div>
            </div>

            {/* Input Row: Type & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>INCIDENT TYPE</label>
                <select 
                  required value={form.crimeType} onChange={(e) => setForm({...form, crimeType: e.target.value})}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                >
                  <option value="">Select Category...</option>
                  <option value="Theft/Robbery">Theft / Robbery</option>
                  <option value="Women Safety">Women Safety Issue</option>
                  <option value="Assault">Physical Assault</option>
                  <option value="Vandalism">Property Vandalism</option>
                  <option value="Traffic">Traffic / Accident</option>
                  <option value="Other">Other Suspicious Activity</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>LOCATION</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    required type="text" placeholder="Street, Landmark, or Area" 
                    value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button type="button" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(58,134,255,0.2)', color: '#3A86FF', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>
                    USE GPS
                  </button>
                </div>
              </div>
            </div>

            {/* Input Row: Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>DATE OF INCIDENT</label>
                <input 
                  type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>TIME</label>
                <input 
                  type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} required
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>DETAILED DESCRIPTION</label>
              <textarea 
                required placeholder="Please describe what happened, any suspects, vehicle numbers, etc..." rows={4}
                value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Media Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '800' }}>EVIDENCE (IMAGES / VIDEOS)</label>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {/* Upload Button */}
                <label style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: '100px', height: '100px', border: '2px dashed var(--border-color)', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s', gap: '8px'
                }}>
                  <UploadCloud size={24} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>UPLOAD</span>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                {/* File Preview */}
                <AnimatePresence>
                  {files.map((file, idx) => {
                    const isVideo = file.type.startsWith('video/');
                    const previewUrl = isVideo ? null : URL.createObjectURL(file);
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'black' }}
                      >
                        {isVideo ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(58,134,255,0.1)' }}>
                            <FileVideo size={30} color="#3A86FF" />
                            <span style={{ fontSize: '0.6rem', marginTop: '4px', maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                          </div>
                        ) : (
                          <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button type="button" onClick={() => removeFile(idx)}
                          style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,0,0,0.8)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '16px' }}>
              <button 
                type="submit" disabled={isSubmitting}
                style={{ 
                  width: '100%', background: 'var(--primary-color)', color: 'white', padding: '16px', 
                  borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '900',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? (
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Activity size={20}/></motion.div>
                ) : (
                   <><AlertCircle size={20}/> SUBMIT SECURE REPORT</>
                )}
              </button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
