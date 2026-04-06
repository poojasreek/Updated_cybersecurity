import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PoliceDashboard from './pages/PoliceDashboard';
import HotspotMapPage from './pages/HotspotMapPage';
import FIRManagementPage from './pages/FIRManagementPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import WomenSafetyPage from './pages/WomenSafetyPage';
import PatrolRoutePage from './pages/PatrolRoutePage';


const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect to role-specific default page
  const defaultRedirect = () => {
    if (!isAuthenticated) return '/';
    if (user?.role === 'citizen') return '/safety-map';
    if (user?.role === 'admin') return '/admin';
    return '/dashboard';
  };

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to={defaultRedirect()} replace />}
        />

        {/* All protected routes share the Layout (sidebar + topbar) */}
        <Route element={<Layout />}>

          {/* Police Routes */}
          <Route path="/dashboard" element={
            user?.role !== 'citizen' ? <PoliceDashboard /> : <Navigate to="/safety-map" replace />
          } />
          <Route path="/hotspot-map" element={<HotspotMapPage />} />
          <Route path="/fir-management" element={<FIRManagementPage />} />
          <Route path="/analytics" element={<PoliceDashboard />} />
          <Route path="/patrol-routes" element={<PatrolRoutePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Citizen Routes */}
          <Route path="/safety-map" element={
            user?.role === 'citizen' ? <CitizenDashboard /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/sos" element={
            user?.role === 'citizen' ? <WomenSafetyPage /> : <Navigate to="/dashboard" replace />
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/admin/analytics" element={
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
