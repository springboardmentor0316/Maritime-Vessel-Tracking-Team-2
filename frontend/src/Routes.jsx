import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import Loading from './components/common/Loading';

// Vessel Pages
import VesselListPage from './pages/vessels/VesselListPage';
import VesselDetailPage from './pages/vessels/VesselDetailPage';
import VesselFormPage from './pages/vessels/VesselFormPage';
import LiveVesselMapPage from './pages/vessels/LiveVesselMapPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Login/Register pages should be created separately */}
      <Route path="/login" element={<PublicRoute><div>Login Page (Already Created)</div></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><div>Register Page (Already Created)</div></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><div>Forgot Password (Already Created)</div></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><div>Reset Password (Already Created)</div></PublicRoute>} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Vessels */}
        <Route path="vessels">
          <Route index element={<VesselListPage />} />
          <Route path="live" element={<LiveVesselMapPage />} />
          <Route path="new" element={<VesselFormPage />} />
          <Route path=":id" element={<VesselDetailPage />} />
          <Route path=":id/edit" element={<VesselFormPage />} />
        </Route>
        
        {/* Ports - Implement similarly */}
        <Route path="ports">
          <Route index element={<div>Port List Page</div>} />
          <Route path=":id" element={<div>Port Detail Page</div>} />
          <Route path="new" element={<div>Port Form Page</div>} />
          <Route path=":id/edit" element={<div>Port Form Page</div>} />
          <Route path="congestion" element={<div>Port Congestion Page</div>} />
        </Route>
        
        {/* Voyages - Implement similarly */}
        <Route path="voyages">
          <Route index element={<div>Voyage List Page</div>} />
          <Route path=":id" element={<div>Voyage Detail Page</div>} />
          <Route path="new" element={<div>Voyage Form Page</div>} />
          <Route path=":id/edit" element={<div>Voyage Form Page</div>} />
        </Route>
        
        {/* Events - Implement similarly */}
        <Route path="events">
          <Route index element={<div>Event List Page</div>} />
          <Route path=":id" element={<div>Event Detail Page</div>} />
        </Route>
        
        {/* Safety */}
        <Route path="safety" element={<div>Safety Overlays Page</div>} />
        
        {/* Analytics */}
        <Route path="analytics" element={<div>Analytics Page</div>} />
        
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;