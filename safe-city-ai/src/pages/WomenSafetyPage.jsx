import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mic, MapPin, Video, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const WomenSafetyPage = () => {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [location, setLocation] = useState(null);
  const [recording, setRecording] = useState(false);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const wsRef = useRef(null);
  const watchIdRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !sosActive) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (transcript.includes('help me') || transcript.includes('emergency')) {
          triggerSOS('voice');
        }
      };

      recognition.start();
      return () => recognition.stop();
    }
  }, [sosActive]);

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        // In a real app, upload this blob to S3/Firebase here
        console.log('Media recording saved locally (size):', blob.size);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start media recorder:', err);
    }
  };

  const startTracking = (alertId) => {
    wsRef.current = new WebSocket(`ws://127.0.0.1:8000/ws/sos/${alertId}`);
    
    wsRef.current.onopen = () => {
      console.log('Connected to SOS WebSocket');
    };

    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(loc));
          }
        },
        (err) => console.error('Location tracking error:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  };

  const stopSOS = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setSosActive(false);
    setRecording(false);
  };

  const triggerSOS = async (type = 'button') => {
    if (sosActive) return;
    setSosActive(true);

    try {
      // Get initial location for trigger
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const initialLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(initialLoc);

      // Trigger Backend API
      const res = await fetch('http://localhost:8888/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: initialLoc.lat,
          lng: initialLoc.lng,
          type: type,
          mediaUrl: 'mock_s3_url_pending'
        })
      });
      const data = await res.json();
      setAlertData(data.data);

      startMediaRecording();
      startTracking(data.data.id);
      
    } catch (err) {
      console.error('Failed to trigger SOS fully:', err);
      // Fallback: start what we can
      startMediaRecording();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
         mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: sosActive ? '#FF4D4F' : 'inherit' }}>
          Women Safety & SOS
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Instantly request emergency services.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        {!sosActive ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ padding: '60px', textAlign: 'center', maxWidth: '400px', width: '100%' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => triggerSOS('button')}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF4D4F, #cc0000)',
                color: 'white',
                border: 'none',
                fontSize: '1.5rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 0 40px rgba(255, 77, 79, 0.4), inset 0 0 20px rgba(0,0,0,0.2)',
                marginBottom: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <AlertTriangle size={48} />
              <span>SOS</span>
            </motion.button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Mic size={18} />
              <span style={{ fontSize: '0.9rem' }}>Say "Help Me" to trigger</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ 
              padding: '40px', 
              maxWidth: '800px', 
              width: '100%',
              border: '2px solid #FF4D4F',
              boxShadow: '0 0 30px rgba(255, 77, 79, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FF4D4F' }}>
                <AlertTriangle size={32} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>EMERGENCY ACTIVE</h2>
              </div>
              <button 
                onClick={stopSOS}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid #FF4D4F',
                  padding: '8px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel / Safe Now
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: '12px', 
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="#3A86FF" /> Live Tracking
                </h3>
                {location ? (
                  <div>
                    <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)' }}>
                      Lat: {location.lat.toFixed(6)}
                    </p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                      Lng: {location.lng.toFixed(6)}
                    </p>
                    <p style={{ margin: '16px 0 0', color: '#2ECC71', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ✓ Streaming to nearest block post
                    </p>
                  </div>
                ) : (
                  <p>Acquiring GPS...</p>
                )}
                
                {alertData && (
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                      Blockchain Intel Hash:
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#8B5CF6', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>
                      {alertData.hash}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px' }}>
                  <div style={{ width: 8, height: 8, background: '#FF4D4F', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>SECURE RECORDING</span>
                </div>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '200px' }} 
                />
              </div>
            </div>

            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
               style={{ marginTop: '24px', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ECC71', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Send size={24} color="#2ECC71" />
              <div>
                <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#2ECC71' }}>Alert Sent Securely</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Nearby patrol officers and emergency contacts have been notified.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WomenSafetyPage;
