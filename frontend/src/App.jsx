import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/common/Toast";

// Your existing pages that work
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// New components
import AppLayout from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

// New pages
import VesselListPage from "./pages/vessels/VesselListPage";
import VesselDetailPage from "./pages/vessels/VesselDetailPage";
import VesselFormPage from "./pages/vessels/VesselFormPage";
import LiveVesselMapPage from "./pages/vessels/LiveVesselMapPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProfilePage from "./pages/profile/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Toast />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* New Protected Routes with Layout */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Vessels */}
              <Route path="vessels">
                <Route index element={<VesselListPage />} />
                <Route path="live" element={<LiveVesselMapPage />} />
                <Route path="new" element={<VesselFormPage />} />
                <Route path=":id" element={<VesselDetailPage />} />
                <Route path=":id/edit" element={<VesselFormPage />} />
              </Route>

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* Placeholders */}
              <Route path="ports" element={<div className="page-placeholder">Ports (Coming Soon)</div>} />
              <Route path="voyages" element={<div className="page-placeholder">Voyages (Coming Soon)</div>} />
              <Route path="events" element={<div className="page-placeholder">Events (Coming Soon)</div>} />
              <Route path="safety" element={<div className="page-placeholder">Safety (Coming Soon)</div>} />
              <Route path="analytics" element={<div className="page-placeholder">Analytics (Coming Soon)</div>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;