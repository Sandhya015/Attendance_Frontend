import React from 'react';
import './Sidebar.css';
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarAlt,
  FaSignOutAlt,
  FaHistory,
  FaRegCalendarAlt
} from 'react-icons/fa';

const Sidebar = ({ activeTab, onTabChange, sidebarOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden={!sidebarOpen}
      />

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} role="navigation">
        <div className="brand">Employee Panel</div>
        <ul>
          <li
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => { onTabChange('dashboard'); onClose(); }}
          >
            <FaTachometerAlt /> Dashboard
          </li>
          <li
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => { onTabChange('attendance'); onClose(); }}
          >
            <FaCalendarAlt /> Attendance
          </li>
          <li
            className={activeTab === 'leave' ? 'active' : ''}
            onClick={() => { onTabChange('leave'); onClose(); }}
          >
            <FaRegCalendarAlt /> Leave Request
          </li>
          <li
            className={activeTab === 'holiday' ? 'active' : ''}
            onClick={() => { onTabChange('holiday'); onClose(); }}
          >
            <FaCalendarAlt /> Holiday Calendar
          </li>
          <li
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => { onTabChange('history'); onClose(); }}
          >
            <FaHistory /> Attendance History
          </li>
          <li onClick={() => { onTabChange('logout'); onClose(); }}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
