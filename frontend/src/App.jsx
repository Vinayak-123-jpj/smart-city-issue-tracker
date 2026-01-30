import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import MapDashboard from './pages/MapDashboard';


import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import MyIssuesPage from './pages/MyIssuesPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'citizen' ? '/citizen/dashboard' : '/authority/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const redirectPath = user.role === 'citizen' ? '/citizen/dashboard' : '/authority/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login/:role" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register/:role" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      <Route path="/citizen/dashboard" element={<ProtectedRoute requiredRole="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/my-issues" element={<ProtectedRoute requiredRole="citizen"><MyIssuesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      <Route path="/authority/dashboard" element={<ProtectedRoute requiredRole="authority"><AuthorityDashboard /></ProtectedRoute>} />
      <Route path="/authority/analytics" element={<ProtectedRoute requiredRole="authority"><AnalyticsDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
      // For Citizens
<Route 
  path="/citizen/map" 
  element={
    <ProtectedRoute requiredRole="citizen">
      <MapDashboard />
    </ProtectedRoute>
  } 
/>

// For Authorities  
<Route 
  path="/authority/map" 
  element={
    <ProtectedRoute requiredRole="authority">
      <MapDashboard />
    </ProtectedRoute>
  } 
/>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  );
}

export default App;