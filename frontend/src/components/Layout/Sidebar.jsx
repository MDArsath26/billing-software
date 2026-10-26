import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Package, 
  Receipt, 
  BarChart3,
  LogOut,
  X 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Your actual app routes mapped to the new design style
  const navItems = [
    { path: "/products", label: "Products", icon: Package },
    { path: "/customers", label: "Customers", icon: Users, badge: "New" },
    { path: "/sales", label: "Sales & Invoices", icon: Receipt },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        
        {/* Header / Logo */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">M</div>
            <div className="logo-text">
              <h1>MOPHY</h1>
              <p>Payment Admin</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          
          {/* Dashboard Accordion Section */}
          <div className="nav-section">
            <button 
              className={`nav-accordion-btn ${location.pathname === '/' ? 'active' : ''}`}
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
            >
              <div className="icon-wrapper blue-bg">
                <LayoutDashboard size={20} color="white" />
              </div>
              <span className="link-text">Dashboard</span>
              <ChevronDown 
                size={16} 
                className={`accordion-arrow ${isDashboardOpen ? 'rotate' : ''}`} 
              />
            </button>

            {isDashboardOpen && (
              <div className="accordion-content">
                <Link to="/" className="sub-link active-sub">Dashboard Light</Link>
                <span className="sub-link">Dashboard Dark</span>
                <span className="sub-link">My Wallet</span>
              </div>
            )}
          </div>

          {/* Regular Menu Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="icon-wrapper">
                    <Icon size={20} />
                </div>
                <span className="link-text">{item.label}</span>
                
                {item.badge && <span className="badge">{item.badge}</span>}
                
                <ChevronRight size={16} className="arrow-right" />
              </Link>
            );
          })}

          {/* Logout Button (Styled as a nav item) */}
          <button onClick={handleLogout} className="nav-item logout-item">
            <div className="icon-wrapper">
                <LogOut size={20} />
            </div>
            <span className="link-text">Logout</span>
          </button>
        </nav>

        {/* Footer Button */}
        <div className="sidebar-footer">
          <button className="docs-btn">
            Docs & Components
            <ExternalLink size={16} />
          </button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
    </>
  );
};

export default Sidebar;