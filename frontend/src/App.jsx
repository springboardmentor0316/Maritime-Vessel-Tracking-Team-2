import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Toast from "./components/common/Toast";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Layout & ProtectedRoute
import AppLayout from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

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

  {/* ================= DASHBOARD ================= */}
  <Route path="dashboard" element={<DashboardPage />} />

  {/* ================= VESSELS ================= */}
  <Route path="vessels">
    {/* View list - all roles */}
    <Route index element={<VesselListPage />} />

    {/* Live map - all roles */}
    <Route path="live" element={<LiveVesselMapPage />} />

    {/* Create vessel - ADMIN ONLY */}
    <Route
      path="new"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <VesselEditPage />
        </ProtectedRoute>
      }
    />

    {/* View vessel details - all roles */}
    <Route path=":id" element={<VesselDetailPage />} />

    {/* Edit vessel - ADMIN ONLY */}
    <Route
      path=":id/edit"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <VesselEditPage />
        </ProtectedRoute>
      }
    />
  </Route>

  {/* ================= ANALYTICS ================= */}
  <Route
    path="analytics"
    element={
      <ProtectedRoute allowedRoles={["admin", "analyst"]}>
        <AnalyticsPage />
      </ProtectedRoute>
    }
  />

  {/* ================= PORTS ================= */}
  <Route
    path="ports"
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <PortsPage />
      </ProtectedRoute>
    }
  />

  {/* ================= SAFETY ================= */}
  <Route
    path="safety"
    element={
      <ProtectedRoute allowedRoles={["admin", "operator"]}>
        <SafetyPage />
      </ProtectedRoute>
    }
  />

  {/* ================= EVENTS ================= */}
  <Route path="events" element={<EventsPage />} />

  {/* ================= PROFILE ================= */}
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
