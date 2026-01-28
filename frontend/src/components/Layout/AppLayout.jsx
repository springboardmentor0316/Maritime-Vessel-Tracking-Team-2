import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './AppLayout.css';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">

      {/* FIXED NAVBAR */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* MAIN AREA */}
      <div className={`app-main ${!sidebarOpen ? 'collapsed' : ''}`}>

        {/* SIDEBAR */}
        <Sidebar isOpen={sidebarOpen} />

        {/* PAGE CONTENT */}
        <main className="app-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
