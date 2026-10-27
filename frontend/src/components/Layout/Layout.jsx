import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className={`main-wrapper ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <header className="top-header">
          <button onClick={toggleSidebar} className="menu-btn">
            <Menu size={24} />
          </button>
          
          {/* Breadcrumbs / Page Title */}
          <div className="breadcrumbs">
             {/* Dynamic title could go here, for now keeping it clean or removing 'Billing App' */}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </div>
  );
};

export default Layout;
