import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Settings, Lock, Mail, Phone, ChevronRight, Loader2, MapPin, Smartphone, SmartphoneNfc } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('police');
  const [email, setEmail] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [securityContext, setSecurityContext] = useState(null); // 'mfa' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, verifySecurity } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!securityContext) {
        // Step 1: Credentials
        const credentials = role === 'police'
          ? { role, password, officer_name: officerName, branch_name: branchName }
          : { role, password, email };

        const response = await login(credentials);

        if (response.needs_mfa) {
          setSecurityContext('mfa');
          setLoading(false);
        } else if (response.needs_otp) {
          setSecurityContext('otp');
          setLoading(false);
        } else {
          // Admin direct login — auth state was already set inside login()
          setLoading(false);
          navigate('/admin');
        }
      } else {
        // Step 2: Verify MFA / OTP
        await verifySecurity({
          email,
          role,
          code: otp,
          officer_name: officerName,
          branch_name: branchName,
        });
        setLoading(false);
        navigate(role === 'police' ? '/fir-management' : '/safety-map');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const roles = [
    { id: 'police', label: 'Police Portal', icon: Shield, color: '#3A86FF' },
    { id: 'citizen', label: 'Citizen View', icon: User, color: '#2ECC71' },
    { id: 'admin', label: 'Admin Access', icon: Settings, color: '#8B5CF6' },
  ];

  return (
    <div className="login-container" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'radial-gradient(circle at center, #1C2541 0%, #0B132B 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--primary-color)', filter: 'blur(100px)', zIndex: 0 }} />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', zIndex: 1, border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div whileHover={{ rotate: 5 }} style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #3A86FF 0%, #00B4D8 100%)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(58, 134, 255, 0.4)' }}>
            <Shield size={42} color="white" strokeWidth={2.5} />
          </motion.div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '4px' }}>SAFE-CITY <span style={{ color: 'var(--primary-color)' }}>AI</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Cloud-Secured Crisis Response Infrastructure</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '4px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
          {roles.map((r) => (
            <button key={r.id} type="button" onClick={() => { setRole(r.id); setSecurityContext(null); setOtp(''); }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px', borderRadius: '10px', background: role === r.id ? 'var(--panel-bg)' : 'transparent', color: role === r.id ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
            >
              <r.icon size={18} style={{ marginBottom: '4px', color: role === r.id ? r.color : 'inherit' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{r.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <AnimatePresence mode="wait">
            {!securityContext ? (
              <motion.div key="creds" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {role === 'police' ? (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>OFFICER IDENTITY</label>
                      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'rgba(0,0,0,0.2)' }}>
                        <User size={18} color="var(--primary-color)" />
                        <input required style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '14px 0', outline: 'none', fontSize: '0.9rem' }} value={officerName} onChange={e => setOfficerName(e.target.value)} placeholder="Full Name (e.g. SI Rajesh Kumar)" />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>ASSIGNED BRANCH</label>
                      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'rgba(0,0,0,0.2)' }}>
                        <MapPin size={18} color="var(--primary-color)" />
                        <input required style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '14px 0', outline: 'none', fontSize: '0.9rem' }} value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="Branch Name (e.g. OMR South)" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>USER EMAIL</label>
                    <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'rgba(0,0,0,0.2)' }}>
                      <Mail size={18} color="var(--primary-color)" />
                      <input required type="email" style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '14px 0', outline: 'none', fontSize: '0.9rem' }} value={email} onChange={e => setEmail(e.target.value)} placeholder={role === 'citizen' ? "citizen@safecity.ai" : "admin@safecity.ai"} />
                    </div>
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                   <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-secondary)' }}>SECURITY KEY (PASSWORD)</label>
                   <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'rgba(0,0,0,0.2)' }}>
                     <Lock size={18} color="var(--primary-color)" />
                     <input required type="password" style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '14px 0', outline: 'none', fontSize: '0.9rem' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                   </div>
                </div>
              </motion.div>
            ) : securityContext === 'mfa' ? (
              <motion.div key="mfa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <Smartphone size={48} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px', fontWeight: '800' }}>Google Authenticator</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Please enter the 6-digit TOTP code from your mobile device.</p>
                <input required type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', maxWidth: '260px', padding: '16px', textAlign: 'center', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '8px', background: 'rgba(0,0,0,0.4)', border: '2px solid var(--primary-color)', borderRadius: '16px', color: 'white', outline: 'none' }} placeholder="      " />
                <div style={{ marginTop: '20px', fontSize: '0.75rem', opacity: 0.3 }}>Secret: JBSWY3DPEHPK3PXP</div>
                <button type="button" onClick={() => setSecurityContext(null)} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Back to Secure Entry</button>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
                <SmartphoneNfc size={48} color="#2ECC71" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px', fontWeight: '800' }}>OTP Verification</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>A 6-digit one-time password has been sent to your registered contact. (Demo Code: 445566)</p>
                <input required type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', maxWidth: '260px', padding: '16px', textAlign: 'center', fontSize: '2.5rem', fontWeight: '800', letterSpacing: '8px', background: 'rgba(0,0,0,0.4)', border: '2px solid #2ECC71', borderRadius: '16px', color: 'white', outline: 'none' }} placeholder="      " />
                <button type="button" onClick={() => setSecurityContext(null)} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Resend Verification Code</button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#FF4D4F', fontSize: '0.85rem', marginTop: '16px', textAlign: 'center', fontWeight: '600', padding: '8px', background: 'rgba(255,77,79,0.1)', borderRadius: '8px' }}>
              {error}
            </motion.div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '32px', padding: '16px', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(58, 134, 255, 0.3)' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <> {securityContext ? 'VERIFY IDENTITY' : 'CONTINUE TO SECURITY'} <ChevronRight size={18} /> </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
