// Mock FIR Data
export const firRecords = [
  { id: 'FIR-2026-001', crimeType: 'Theft', location: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341, date: '2026-03-28', time: '14:30', status: 'Open', severity: 'medium', description: 'Chain snatching incident near the bus stop.', officer: 'SI Rajesh Kumar' },
  { id: 'FIR-2026-002', crimeType: 'Women Safety', location: 'Anna Nagar, Chennai', lat: 13.0850, lng: 80.2101, date: '2026-03-29', time: '22:15', status: 'Under Investigation', severity: 'high', description: 'Stalking complaint filed by college student.', officer: 'SI Priya Sharma' },
  { id: 'FIR-2026-003', crimeType: 'Accident', location: 'OMR Road, Chennai', lat: 12.9516, lng: 80.2402, date: '2026-03-30', time: '08:45', status: 'Resolved', severity: 'low', description: 'Minor vehicle collision at signal junction.', officer: 'SI Vikram Singh' },
  { id: 'FIR-2026-004', crimeType: 'NDPS', location: 'Royapuram, Chennai', lat: 13.1140, lng: 80.2970, date: '2026-03-31', time: '03:20', status: 'Open', severity: 'high', description: 'Suspected drug trafficking near port area.', officer: 'SI Arjun Reddy' },
  { id: 'FIR-2026-005', crimeType: 'IPC', location: 'Adyar, Chennai', lat: 13.0067, lng: 80.2573, date: '2026-04-01', time: '16:00', status: 'Under Investigation', severity: 'medium', description: 'Assault case reported outside shopping complex.', officer: 'SI Deepa Menon' },
  { id: 'FIR-2026-006', crimeType: 'Theft', location: 'Mylapore, Chennai', lat: 13.0368, lng: 80.2676, date: '2026-04-01', time: '11:30', status: 'Open', severity: 'medium', description: 'Two-wheeler theft from parking lot.', officer: 'SI Rajesh Kumar' },
  { id: 'FIR-2026-007', crimeType: 'Women Safety', location: 'Guindy, Chennai', lat: 13.0067, lng: 80.2206, date: '2026-04-02', time: '19:45', status: 'Open', severity: 'high', description: 'Eve-teasing complaint near metro station.', officer: 'SI Priya Sharma' },
  { id: 'FIR-2026-008', crimeType: 'Accident', location: 'ECR Road, Chennai', lat: 12.8996, lng: 80.2509, date: '2026-04-02', time: '06:00', status: 'Under Investigation', severity: 'high', description: 'Hit-and-run case on ECR Highway.', officer: 'SI Vikram Singh' },
  { id: 'FIR-2026-009', crimeType: 'IPC', location: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000, date: '2026-04-03', time: '13:10', status: 'Open', severity: 'low', description: 'Property dispute escalated to altercation.', officer: 'SI Arjun Reddy' },
  { id: 'FIR-2026-010', crimeType: 'NDPS', location: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180, date: '2026-04-03', time: '01:30', status: 'Under Investigation', severity: 'high', description: 'Illegal substance possession during raid.', officer: 'SI Deepa Menon' },
];

// Crime Zones for Map
export const crimeZones = [
  { id: 1, name: 'T. Nagar Zone', lat: 13.0418, lng: 80.2341, radius: 600, crimeCount: 28, riskScore: 85, dominantCrime: 'Theft', severity: 'high', recentCrimes: ['Chain snatching', 'Pickpocketing', 'Shop lifting'] },
  { id: 2, name: 'Anna Nagar Zone', lat: 13.0850, lng: 80.2101, radius: 500, crimeCount: 15, riskScore: 72, dominantCrime: 'Women Safety', severity: 'high', recentCrimes: ['Stalking', 'Eve-teasing', 'Harassment'] },
  { id: 3, name: 'OMR Zone', lat: 12.9516, lng: 80.2402, radius: 700, crimeCount: 22, riskScore: 60, dominantCrime: 'Accident', severity: 'medium', recentCrimes: ['Vehicle collision', 'Hit-and-run', 'Drunk driving'] },
  { id: 4, name: 'Royapuram Zone', lat: 13.1140, lng: 80.2970, radius: 450, crimeCount: 18, riskScore: 78, dominantCrime: 'NDPS', severity: 'high', recentCrimes: ['Drug trafficking', 'Substance abuse', 'Illegal possession'] },
  { id: 5, name: 'Adyar Zone', lat: 13.0067, lng: 80.2573, radius: 500, crimeCount: 10, riskScore: 40, dominantCrime: 'IPC', severity: 'medium', recentCrimes: ['Assault', 'Property dispute'] },
  { id: 6, name: 'Mylapore Zone', lat: 13.0368, lng: 80.2676, radius: 400, crimeCount: 12, riskScore: 55, dominantCrime: 'Theft', severity: 'medium', recentCrimes: ['Vehicle theft', 'Bag snatching'] },
  { id: 7, name: 'Guindy Zone', lat: 13.0067, lng: 80.2206, radius: 550, crimeCount: 14, riskScore: 68, dominantCrime: 'Women Safety', severity: 'high', recentCrimes: ['Eve-teasing', 'Stalking'] },
  { id: 8, name: 'ECR Zone', lat: 12.8996, lng: 80.2509, radius: 800, crimeCount: 20, riskScore: 65, dominantCrime: 'Accident', severity: 'medium', recentCrimes: ['Hit-and-run', 'Over speeding crash'] },
  { id: 9, name: 'Tambaram Zone', lat: 12.9249, lng: 80.1000, radius: 500, crimeCount: 6, riskScore: 25, dominantCrime: 'IPC', severity: 'low', recentCrimes: ['Property dispute'] },
  { id: 10, name: 'Velachery Zone', lat: 12.9815, lng: 80.2180, radius: 500, crimeCount: 16, riskScore: 70, dominantCrime: 'NDPS', severity: 'high', recentCrimes: ['Drug raid', 'Illegal substance'] },
  { id: 11, name: 'Nungambakkam Zone', lat: 13.0569, lng: 80.2425, radius: 400, crimeCount: 4, riskScore: 15, dominantCrime: 'None', severity: 'safe', recentCrimes: [] },
  { id: 12, name: 'Besant Nagar Zone', lat: 13.0002, lng: 80.2660, radius: 450, crimeCount: 3, riskScore: 12, dominantCrime: 'None', severity: 'safe', recentCrimes: [] },
];

// Dashboard Stats
export const dashboardStats = {
  totalFIRs: 156,
  openCases: 42,
  resolvedCases: 98,
  underInvestigation: 16,
  sosAlerts: 7,
  patrolsActive: 12,
  highRiskZones: 5,
  dailyCrimes: [
    { day: 'Mon', count: 12, theft: 4, women: 2, accident: 3, ndps: 1, ipc: 2 },
    { day: 'Tue', count: 8, theft: 3, women: 1, accident: 2, ndps: 1, ipc: 1 },
    { day: 'Wed', count: 15, theft: 5, women: 3, accident: 4, ndps: 2, ipc: 1 },
    { day: 'Thu', count: 10, theft: 3, women: 2, accident: 2, ndps: 1, ipc: 2 },
    { day: 'Fri', count: 18, theft: 6, women: 4, accident: 3, ndps: 3, ipc: 2 },
    { day: 'Sat', count: 22, theft: 7, women: 5, accident: 5, ndps: 2, ipc: 3 },
    { day: 'Sun', count: 14, theft: 4, women: 3, accident: 3, ndps: 2, ipc: 2 },
  ],
  monthlyCrimes: [
    { month: 'Jan', count: 120 }, { month: 'Feb', count: 98 },
    { month: 'Mar', count: 145 }, { month: 'Apr', count: 60 },
  ],
  crimeTypeDistribution: [
    { name: 'Theft', value: 35, color: '#FF8C00' },
    { name: 'Women Safety', value: 22, color: '#FFD60A' },
    { name: 'Accidents', value: 20, color: '#00B4D8' },
    { name: 'NDPS', value: 13, color: '#FF4D4F' },
    { name: 'IPC', value: 10, color: '#8B5CF6' },
  ],
};

// SOS Alerts
export const sosAlerts = [
  { id: 1, type: 'SOS', location: 'T. Nagar', time: '2 min ago', status: 'active', lat: 13.0425, lng: 80.2348 },
  { id: 2, type: 'Panic', location: 'Anna Nagar', time: '5 min ago', status: 'active', lat: 13.0860, lng: 80.2115 },
  { id: 3, type: 'SOS', location: 'Guindy', time: '12 min ago', status: 'responding', lat: 13.0075, lng: 80.2210 },
  { id: 4, type: 'Accident', location: 'OMR', time: '18 min ago', status: 'resolved', lat: 12.9520, lng: 80.2410 },
];

export const blockchainTransactions = [
  { hash: '0x9f2a8b3d5c1e4f6a7b8c9d0e1f2a3b4c5d6e7f8a', time: '18:30', event: 'FIR-2026-011 Committed', status: 'Confirmed', block: '14,285,124' },
  { hash: '0x8a4fe29c3d1b4a5d6e7f8a9b0c1d2e3f4a5b6c7d', time: '17:45', event: 'SOS-105 Registry', status: 'Confirmed', block: '14,285,092' },
  { hash: '0x7b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c', time: '16:20', event: 'Zone Update: T. Nagar', status: 'Confirmed', block: '14,284,980' },
  { hash: '0x6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e', time: '15:10', event: 'Evidence Upload: FIR-2026-008', status: 'Confirmed', block: '14,284,812' },
  { hash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d', time: '12:45', event: 'Patrol Dispatch: Unit 7', status: 'Confirmed', block: '14,284,560' },
];

export const crimeTypes = ['All', 'Theft', 'Women Safety', 'Accident', 'NDPS', 'IPC'];
export const statusTypes = ['All', 'Open', 'Under Investigation', 'Resolved'];

// --- ACCIDENT MONITORING DATA (IRAD) ---
export const accidentRecords = [
  { id: 'ACC-2026-001', location: 'Anna Salai, Chennai', lat: 13.0633, lng: 80.2500, date: '2026-04-01', time: '08:45', severity: 'Fatal', cause: 'Over Speeding', weather: 'Clear', roadType: 'National Highway', vehicleType: 'HCV' },
  { id: 'ACC-2026-002', location: 'Mount Road, Chennai', lat: 13.0233, lng: 80.2100, date: '2026-04-01', time: '13:20', severity: 'Grievous', cause: 'Drunk Driving', weather: 'Rainy', roadType: 'Urban Road', vehicleType: 'Two Wheeler' },
  { id: 'ACC-2026-003', location: 'Koyambedu, Chennai', lat: 13.0733, lng: 80.1900, date: '2026-04-02', time: '19:10', severity: 'Minor', cause: 'Animal Crossing', weather: 'Foggy', roadType: 'State Highway', vehicleType: 'LMV' },
  { id: 'ACC-2026-004', location: 'Perungudi, OMR', lat: 12.9633, lng: 80.2450, date: '2026-04-03', time: '23:45', severity: 'Fatal', cause: 'Distracted Driving', weather: 'Clear', roadType: 'Expressway', vehicleType: 'Four Wheeler' },
  { id: 'ACC-2026-005', location: 'Tambaram, Chennai', lat: 12.9233, lng: 80.1100, date: '2026-04-03', time: '07:30', severity: 'Grievous', cause: 'Tire Burst', weather: 'Mist', roadType: 'National Highway', vehicleType: 'Bus' },
];

export const roadSafetyHotspots = [
  { id: 'HOT-001', name: 'Kathipara Junction', lat: 13.0067, lng: 80.2206, riskScore: 92, status: 'High Risk', primaryCause: 'Merging Traffic' },
  { id: 'HOT-002', name: 'Madhuravoyal Bypass', lat: 13.0450, lng: 80.1650, riskScore: 85, status: 'High Risk', primaryCause: 'Overspeeding' },
  { id: 'HOT-003', name: 'Sholinganallur Signal', lat: 12.9010, lng: 80.2279, riskScore: 78, status: 'Moderate Risk', primaryCause: 'Signal Jumping' },
];

export const accidentStats = {
  monthlyAccidents: [
    { month: 'Jan', count: 45, fatal: 12 }, { month: 'Feb', count: 38, fatal: 8 },
    { month: 'Mar', count: 52, fatal: 15 }, { month: 'Apr', count: 18, fatal: 4 },
  ],
  hourlyTrend: [
    { hour: '00-04', count: 12 }, { hour: '04-08', count: 25 }, 
    { hour: '08-12', count: 48 }, { hour: '12-16', count: 32 },
    { hour: '16-20', count: 55 }, { hour: '20-00', count: 20 },
  ],
};

export const emergencyContacts = [
  { id: 1, name: 'Arun Kumar', relation: 'Father', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Raj', relation: 'Sister', phone: '+91 98765 43211' },
];

export const offenderRecords = [
  {
    id: 'OFF-1042',
    name: 'Rajesh Kumar',
    age: 24,
    history: ['Petty Theft (2023)', 'Shoplifting (2024)', 'Vandalism (2025)'],
    frequency: 'Increasing (3 incidents in 2 years)',
    pattern: 'Opportunistic property crimes in commercial zones during evening hours.',
    riskScore: 68,
    riskLevel: 'Medium',
    biasScore: 98,
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
  },
  {
    id: 'OFF-4581',
    name: 'Suresh Babu',
    age: 42,
    history: ['Burglary (2021)', 'Theft (2023)', 'Grand Theft (2025)'],
    frequency: 'Consistent property crimes',
    pattern: 'Targets residential areas during mid-day when occupants are usually at work.',
    riskScore: 75,
    riskLevel: 'High',
    biasScore: 94,
    recommendations: []
  },
  {
    id: 'OFF-1102',
    name: 'Pooja Nair',
    age: 22,
    history: ['Cyber Harassment (2026)', 'Stalking (2026)'],
    frequency: 'Escalating rapidly',
    pattern: 'Cyber offenses transitioning into physical proximity stalking (Women Safety).',
    riskScore: 82,
    riskLevel: 'High',
    biasScore: 98,
    recommendations: []
  },
  {
    id: 'OFF-6729',
    name: 'Karthik Raja',
    age: 31,
    history: ['DUI (2022)', 'Reckless Driving (2024)', 'Accident - Hit and Run (2025)'],
    frequency: 'Consistent vehicular endangerment',
    pattern: 'Late night driving offenses under the influence in suburban routes.',
    riskScore: 91,
    riskLevel: 'High',
    biasScore: 95,
    recommendations: []
  },
  {
    id: 'OFF-8843',
    name: 'Amina Sheikh',
    age: 26,
    history: ['Fraud (2024)', 'Identity Theft (2025)'],
    frequency: 'Emerging financial crimes',
    pattern: 'Sophisticated phishing and identity theft targeting elderly citizens.',
    riskScore: 55,
    riskLevel: 'Medium',
    biasScore: 99,
    recommendations: []
  },
  {
    id: 'OFF-5091',
    name: 'Ravi Teja',
    age: 19,
    history: ['Vandalism (2025)', 'Public Intoxication (2026)'],
    frequency: 'Recent petty offenses',
    pattern: 'Minor disruptions linked to peer group activities late at night.',
    riskScore: 30,
    riskLevel: 'Low',
    biasScore: 97,
    recommendations: []
  }
];
