
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { apiService } from './services/api';
import { User, UserRole, ApplicationStatus } from './types';

// Pages
import PublicPortal from './pages/PublicPortal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import DistrictAdminDashboard from './pages/DistrictAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ApplicationDetail from './pages/ApplicationDetail';
import AuditLogsView from './pages/AuditLogsView';
import Payments from './pages/Payments';

const Header = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => (
  <header className="gov-blue text-white shadow-md">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-1 rounded">
          <svg className="w-8 h-8 text-blue-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.293 3.293a1 1 0 01-1.414 0l-3.293-3.293a1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.789l1.599.8L9 4.323V3a1 1 0 011-1zm0 5a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" /></svg>
        </div>
        <Link to="/" className="hover:opacity-90">
          <h1 className="text-xl font-bold leading-tight">CSDP</h1>
          <p className="text-xs opacity-80 uppercase tracking-widest text-white">Citizen Services & Benefits</p>
        </Link>
      </div>
      <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
        <Link to="/" className="hover:text-blue-200">Public Portal</Link>
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
            {user.role === UserRole.SUPER_ADMIN && <Link to="/payments" className="hover:text-blue-200">Payments</Link>}
            <button onClick={onLogout} className="bg-red-700 px-3 py-1 rounded hover:bg-red-800 transition">Logout</button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-500 transition">Sign In</Link>
        )}
      </nav>
    </div>
    <div className="gov-accent"></div>
  </header>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const curr = apiService.getCurrentUser();
    setUser(curr);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading system...</div>;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PublicPortal />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/signup" element={<Signup onLogin={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route path="/onboarding" element={user ? <Onboarding user={user} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={<DashboardRouter user={user} />} />
            <Route path="/application/:id" element={<ApplicationDetail user={user} />} />
            
            {/* Admin only */}
            <Route path="/audit-logs" element={<AuditLogsView />} />
            <Route path="/payments" element={user?.role === UserRole.SUPER_ADMIN ? <Payments /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        <footer className="bg-gray-200 py-6 mt-12 border-t border-gray-300">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            <p>&copy; 2024 Citizen Services & Digital Benefits Platform. Educational Resource.</p>
            <p className="mt-2 text-xs">This platform contains intentional security vulnerabilities for training purposes.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const DashboardRouter = ({ user }: { user: User | null }) => {
  if (!user) return <Navigate to="/login" />;
  if (!user.profileCompleted && user.role === UserRole.BENEFICIARY) return <Navigate to="/onboarding" />;

  switch (user.role) {
    case UserRole.SUPER_ADMIN: return <SuperAdminDashboard user={user} />;
    case UserRole.DISTRICT_ADMIN: return <DistrictAdminDashboard user={user} />;
    case UserRole.LOCAL_OFFICER: return <OfficerDashboard user={user} />;
    default: return <CitizenDashboard user={user} />;
  }
};

export default App;
