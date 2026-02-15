import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/common/Toast";
import { useAuth } from "./context/AuthContext";


// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Layout & ProtectedRoute
import AppLayout from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleProtectedRoute from "./components/common/RoleProtectedRoute";


// App Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import VesselListPage from "./pages/vessels/VesselListPage";
import VesselDetailPage from "./pages/vessels/VesselDetailPage";
import VesselEditPage from "./pages/vessels/VesselEditPage";
import LiveVesselMapPage from "./pages/vessels/LiveVesselMapPage";
import ProfilePage from "./pages/profile/ProfilePage";
import AnalyticsPage from "./pages/analytics/AnalyticsPage";

// ⭐ New Safety Page
import SafetyPage from "./pages/safety/safetypage";
import EventsPage from "./pages/events/EventsPage";
import PortsPage from "./pages/ports/PortsPage";



function App() {
 

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Toast />

          <Routes>

            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ---------- PROTECTED ROUTES ---------- */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />

              {/* Dashboard */}
              <Route path="dashboard" element={<DashboardPage />} />

              {/* ---------- VESSELS ---------- */}
              <Route path="vessels">
                <Route index element={<VesselListPage />} />
                <Route path="live" element={<LiveVesselMapPage />} />
                <Route path="new" element={<VesselEditPage />} />
                <Route path=":id" element={<VesselDetailPage />} />
                <Route path=":id/edit" element={<VesselEditPage />} />
              </Route>

              {/* Analytics */}
              <Route
  path="analytics"
  element={
    <RoleProtectedRoute allowedRoles={["admin", "analyst"]}>
      <AnalyticsPage />
    </RoleProtectedRoute>
  }
/>



              {/* Ports (⭐ Newly Added) */}
              <Route path="ports" element={<PortsPage />} />

              {/* Safety */}
              <Route path="safety" element={<SafetyPage />} />

              {/* Events */}
              <Route path="events" element={<EventsPage />} />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              
            </Route>

            {/* Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
