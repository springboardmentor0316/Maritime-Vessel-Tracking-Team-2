import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/Dashboard";
import VesselTracking from "./pages/VesselTracking";
import VoyageReplay from "./pages/VoyageReplay"; 

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/admin" element={<AdminDashboard />} />

        {/* MAIN PAGES */}
        <Route path="/vessel-tracking" element={<VesselTracking />} />
        <Route path="/voyage-replay" element={<VoyageReplay />} />

        {/* DEFAULT */}
        <Route path="*" element={<VesselTracking />} />
      </Routes>
    
  );
}

export default App;
