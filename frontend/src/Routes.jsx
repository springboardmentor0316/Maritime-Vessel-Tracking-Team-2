import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/Layout/AppLayout';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/common/ProtectedRoute';


// Vessel Pages
import VesselListPage from './pages/vessels/VesselListPage';
import VesselDetailPage from './pages/vessels/VesselDetailPage';
import VesselFormPage from './pages/vessels/VesselFormPage';
import LiveVesselMapPage from './pages/vessels/LiveVesselMapPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Profile
import ProfilePage from './pages/profile/ProfilePage';


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
        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={["admin","operator","analyst"]}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Vessels */}
{/* Vessels - LIST (GET allowed for all roles) */}
<Route
  path="vessels"
  element={
    <ProtectedRoute allowedRoles={["admin", "operator", "analyst"]}>
      <VesselListPage />
    </ProtectedRoute>
  }
/>

{/* Vessel Details - GET allowed for all */}
<Route
  path="vessels/:id"
  element={
    <ProtectedRoute allowedRoles={["admin", "operator", "analyst"]}>
      <VesselDetailPage />
    </ProtectedRoute>
  }
/>

{/* Create Vessel - POST (Admin + Operator only) */}
<Route
  path="vessels/new"
  element={
    <ProtectedRoute allowedRoles={["admin", "operator"]}>
      <VesselFormPage />
    </ProtectedRoute>
  }
/>

{/* Edit Vessel - DELETE / PUT (Admin only) */}
<Route
  path="vessels/:id/edit"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <VesselFormPage />
    </ProtectedRoute>
  }
/>


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
        <Route path="safety" element={
          <ProtectedRoute allowedRoles={["admin","analyst"]}>
            <div>Safety Overlays Page</div>
          </ProtectedRoute>
        } />
        
        {/* Analytics */}
        <Route path="analytics" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <div>Analytics Page</div>
          </ProtectedRoute>
        } />
        
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;