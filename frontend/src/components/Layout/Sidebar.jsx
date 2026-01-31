import React from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../constants";
import "./Sidebar.css";

const Sidebar = ({ isOpen }) => {
  // Separate Profile item
  const profileItem = NAV_ITEMS.find((item) => item.id === "profile");
  const otherItems = NAV_ITEMS.filter((item) => item.id !== "profile");

  return (
    <aside className={`sidebar ${!isOpen ? "sidebar-collapsed" : ""}`}>
      
      {/* TOP MENU ITEMS */}
      <div className="sidebar-menu">
        {otherItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div className="nav-group">
                <div className="nav-group-label">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
                <div className="nav-group-items">
                  {item.children.map((child) => (
  <NavLink
    key={child.id}
    to={child.path}
    end={child.id === "vessels-list"}   // EXACT FIX HERE
    className={({ isActive }) =>
      `nav-item ${isActive ? 'active' : ''}`
    }
  >
    <span className="nav-label">{child.label}</span>
  </NavLink>
))}

                </div>
              </div>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </div>

      {/* BOTTOM PROFILE */}
      <div className="sidebar-profile">
        <NavLink
          to={profileItem.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">{profileItem.icon}</span>
          <span className="nav-label">{profileItem.label}</span>
        </NavLink>
      </div>

    </aside>
  );
};

export default Sidebar;
