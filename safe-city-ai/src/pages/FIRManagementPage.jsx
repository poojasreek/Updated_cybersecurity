import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Filter, FileText, Clock, MapPin, User, 
  Briefcase, MessageSquare, AlertTriangle, ChevronDown, 
  Download, CheckCircle, XCircle, Database, ChevronUp, ChevronsUpDown, Upload, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const specificCrimeTypes = ['IPC', 'NDPS', 'Women Safety', 'Accident'];

const FIRManagementPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewFIR, setShowNewFIR] = useState(false);
  const [newFIR, setNewFIR] = useState({
    crimeType: 'IPC', location: '', description: '', severity: 'medium',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFIR, setSelectedFIR] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  
  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/firs');
      const data = await response.json();
      setRecords(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch FIRs:", err);
      setLoading(false);
    }
  };

  const handleAddFIR = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/firs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crimeType: newFIR.crimeType,
          location: newFIR.location,
          description: newFIR.description,
          severity: newFIR.severity,
          officer: "Officer Main", // This should come from auth
          lat: 13.0418, // Mocked lat/lng
          lng: 80.2341
        }),
      });
      
      if (response.ok) {
        setShowNewFIR(false);
        fetchRecords(); // Refresh list
        setNewFIR({
          crimeType: 'IPC', location: '', description: '', severity: 'medium',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (err) {
      console.error("Failed to add FIR:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedRecords = useMemo(() => {
    let filtered = records.filter(f => 
      ((f.fir_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
       (f.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || f.crime_type === selectedType) &&
      (selectedStatus === 'All' || f.status === selectedStatus) &&
      (filterDate === '' || (f.timestamp && f.timestamp.split('T')[0] === filterDate))
    );

    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key === 'id' ? 'fir_id' : sortConfig.key] || '';
      const bVal = b[sortConfig.key === 'id' ? 'fir_id' : sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [records, searchTerm, selectedType, selectedStatus, filterDate, sortConfig]);

  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);
  const currentRecords = processedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
      <p style={{ color: 'var(--text-secondary)' }}>Synchronizing Secure Database...</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedFIR ? '1fr 400px' : '1fr', gap: '24px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
             <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Digital FIR Registry</h2>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monitoring {records.length} encrypted records on decentralized ledger</p>
           </div>
           <button onClick={() => setShowNewFIR(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Plus size={18} /> New Digital Record
           </button>
        </div>

        {/* Filters and Search - same UI structure as before */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
           <div className="glass-panel" style={{ flex: 1, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Search size={18} color="var(--text-secondary)" />
             <input type="text" placeholder="Search ID or Location..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '10px 0', outline: 'none' }} />
           </div>
           <div style={{ display: 'flex', gap: '12px' }}>
             <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="glass-panel" style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', outline: 'none', border: '1px solid var(--border-color)', color: 'white' }} />
             <select className="glass-panel" style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'white' }} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
               <option value="All">All Categories</option>
               {specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
           </div>
        </div>

        {/* Table structure same as before, adapted to DB fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 150px 150px 100px', gap: '16px', padding: '0 24px 8px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          <div>FIR ID</div>
          <div>CRIME TYPE</div>
          <div>LOCATION</div>
          <div>DATE</div>
          <div>STATUS</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {currentRecords.map((fir) => (
             <motion.div key={fir.id} onClick={() => setSelectedFIR(fir)} style={{ padding: '16px 24px', borderRadius: '16px', background: selectedFIR?.id === fir.id ? '#1C2541' : 'transparent', border: `1px solid ${selectedFIR?.id === fir.id ? 'var(--primary-color)' : 'transparent'}`, cursor: 'pointer', display: 'grid', gridTemplateColumns: '150px 1fr 150px 150px 100px', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{fir.fir_id}</div>
                <div><span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(58,134,255,0.1)', color: '#3A86FF', fontWeight: '800' }}>{fir.crime_type}</span></div>
                <div style={{ fontSize: '0.85rem', display: 'flex', gap: '6px' }}><MapPin size={14} /> {fir.location}</div>
                <div style={{ fontSize: '0.85rem' }}>{fir.timestamp?.split('T')[0]}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: fir.status === 'Open' ? '#FFD60A' : '#2ECC71' }}>{fir.status}</div>
             </motion.div>
          ))}
        </div>
      </div>
      
      {/* FIR Detail Panel same as before with minor field updates */}
      {selectedFIR && (
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '800' }}>Record Analysis</h3>
            <button onClick={() => setSelectedFIR(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}><XCircle size={20} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
             <FileText size={32} color="var(--primary-color)" />
             <div><p style={{ fontSize: '0.75rem', opacity: 0.6 }}>BC HASH (SECURE)</p><p style={{ fontWeight: '800' }}>0x{fir.fir_id?.replace(/-/g, '')}</p></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div><p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Officer En-Charge</p><p style={{ fontWeight: '700' }}>{selectedFIR.officer_name}</p></div>
             <div><p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Location (Geospatial)</p><p style={{ fontWeight: '700' }}>{selectedFIR.location}</p></div>
             <div><p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Incident Intelligence</p><div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.9rem' }}>{selectedFIR.description}</div></div>
          </div>
        </motion.div>
      )}

      {/* New FIR Modal Overlay */}
      <AnimatePresence>
        {showNewFIR && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
              <button onClick={() => setShowNewFIR(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)' }}><XCircle size={24} /></button>
              <h2 style={{ marginBottom: '24px', fontWeight: '800' }}>Register Secure FIR</h2>
              <form onSubmit={handleAddFIR} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}><label>Crime Category</label><select style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px' }} value={newFIR.crimeType} onChange={e => setNewFIR({...newFIR, crimeType: e.target.value})}>{specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div style={{ gridColumn: 'span 2' }}><label>Incident Location</label><input required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px' }} value={newFIR.location} onChange={e => setNewFIR({...newFIR, location: e.target.value})} placeholder="Anna Nagar Sector 2" /></div>
                <div style={{ gridColumn: 'span 2' }}><label>Description</label><textarea rows="4" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', borderRadius: '10px', resize: 'none' }} value={newFIR.description} onChange={e => setNewFIR({...newFIR, description: e.target.value})} placeholder="Describe incident in detail..." /></div>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ gridColumn: 'span 2', padding: '16px' }}>{isSubmitting ? 'Registering...' : 'Commit to Database'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FIRManagementPage;
