import React, { useEffect, useState } from 'react';
import {
  checkin, checkout, getHistory,
  getLeaveHistory, submitLeaveRequest,
  getEmployeeSummary, getProfile,
  updateEmployeeProfile
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './EmployeeDashboard.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaHome, FaUser, FaClock, FaRegCalendarAlt, FaCalendarAlt, FaHistory, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import logo from '../assets/logooo.jpg';

ChartJS.register(ArcElement, Tooltip, Legend);

const Sidebar = ({ activeTab, setActiveTab, handleLogout, sidebarOpen, onClose }) => (
  <>
    <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={onClose}></div>
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo">Employee</div>
      <ul>
        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); onClose(); }}><FaHome /> Dashboard</li>
        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => { setActiveTab('profile'); onClose(); }}><FaUser /> Profile</li>
        <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => { setActiveTab('attendance'); onClose(); }}><FaClock /> Attendance</li>
        <li className={activeTab === 'leave' ? 'active' : ''} onClick={() => { setActiveTab('leave'); onClose(); }}><FaRegCalendarAlt /> Leave Request</li>
        <li className={activeTab === 'holiday' ? 'active' : ''} onClick={() => { setActiveTab('holiday'); onClose(); }}><FaCalendarAlt /> Holiday Calendar</li>
        <li className={activeTab === 'history' ? 'active' : ''} onClick={() => { setActiveTab('history'); onClose(); }}><FaHistory /> Attendance History</li>
        <li onClick={() => { handleLogout(); onClose(); }}><FaSignOutAlt /> Logout</li>
      </ul>
    </aside>
  </>
);

const TopNavbar = ({ onMenuClick }) => (
  <header className="dashboard-navbar">
    <button className="hamburger-btn" onClick={onMenuClick}>☰</button>
    <div className="navbar-title">Employee Dashboard</div>
    <img src={logo} alt="Logo" className="navbar-logo-top-right" />
  </header>
);

const SummaryCards = ({ summary, leavesLeft, nextHoliday, employee }) => (
  <div className="summary-cards">
    <div className="card">
      <h4>Upcoming Holiday</h4>
      <p><small>{nextHoliday?.date || ''}</small></p>
    </div>
    <div className="card">
      <h4>Leaves Taken</h4>
      <p>{summary.leavesTaken}</p>
    </div>
    <div className="card">
      <h4>Leaves Left</h4>
      <p>{leavesLeft}</p>
    </div>
    <div className="card">
      <h4>Pending Requests</h4>
      <p>{summary.pendingRequests}</p>
    </div>
    <div className="card profile-summary-card">
      <div className="profile-avatar-small">👤</div>
      <div style={{ marginLeft: 8 }}>
        <div><strong>{employee.name}</strong></div>
        <div style={{ fontSize: 13 }}>{employee.email}</div>
        <div style={{ fontSize: 13 }}>{employee.department} | {employee.position}</div>
      </div>
    </div>
  </div>
);

const DashboardTab = ({ employee }) => {
  const data = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance',
        data: [85, 15],
        backgroundColor: ['#4caf50', '#f44336'],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="dashboard-profile-chart">
      <div className="card profile-summary">
        <div className="profile-avatar-large">👤</div>
        <h4>{employee.name}</h4>
        <p>{employee.email}</p>
        <div style={{ fontSize: 14, margin: "0.5rem 0" }}>{employee.department} | {employee.position}</div>
      </div>
      <div className="card small-chart">
        <h3>Attendance Overview</h3>
        <Pie data={data} />
      </div>
    </div>
  );
};

const AttendanceTab = () => {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const handleCheckIn = () => setShowCheckIn(true);
  const handleCheckOut = () => setShowCheckOut(true);

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!checkInDate) {
      toast.error('Please select a date for check-in.');
      return;
    }
    const now = new Date();
    const dateTime = new Date(`${checkInDate}T${now.getHours()}:${now.getMinutes()}`);

    try {
      await checkin({ datetime: dateTime.toISOString().slice(0, 16) });
      setCheckInTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
      toast.success('Check-in submitted for approval');
      setShowCheckIn(false);
    } catch (err) {
      toast.error('Check-in failed');
      console.error(err);
    }
  };

  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    if (!checkOutDate) {
      toast.error('Please select a date for check-out.');
      return;
    }
    const now = new Date();
    const dateTime = new Date(`${checkOutDate}T${now.getHours()}:${now.getMinutes()}`);

    try {
      await checkout({ datetime: dateTime.toISOString().slice(0, 16) });
      setCheckOutTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
      toast.success('Checked out successfully');
      setShowCheckOut(false);
    } catch (err) {
      toast.error('Check-out failed');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="btn-group">
        <button onClick={handleCheckIn}>Check In</button>
        <button onClick={handleCheckOut}>Check Out</button>
      </div>
      {showCheckIn && (
        <form className="attendance-form-modal" onSubmit={handleCheckInSubmit}>
          <label>
            Date
            <input
              type="date"
              value={checkInDate}
              onChange={e => setCheckInDate(e.target.value)}
              required
              className="calendar-input"
            />
          </label>
          <label>
            Time
            <input
              type="text"
              value={new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              disabled
            />
          </label>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      )}
      {showCheckOut && (
        <form className="attendance-form-modal" onSubmit={handleCheckOutSubmit}>
          <label>
            Date
            <input
              type="date"
              value={checkOutDate}
              onChange={e => setCheckOutDate(e.target.value)}
              required
              className="calendar-input"
            />
          </label>
          <label>
            Time
            <input
              type="text"
              value={new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              disabled
            />
          </label>
          <div>
            <button type="submit">Submit</button>
            <button type="button" className="cancel-btn" onClick={() => setShowCheckOut(false)}>

            </button>
          </div>
        </form>
      )}
      {checkInTime && checkInDate && (
        <p style={{ marginTop: '1rem', fontSize: '14px' }}>
          ✅ Checked in at: <strong>{checkInDate} {checkInTime}</strong>
        </p>
      )}
      {checkOutTime && checkOutDate && (
        <p style={{ marginTop: '0.7rem', fontSize: '14px' }}>
          ✅ Checked out at: <strong>{checkOutDate} {checkOutTime}</strong>
        </p>
      )}
    </div>
  );
};



// LeaveTab and LeaveHistory side by side in a grid
const LeaveTab = () => {
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    getLeaveHistory()
      .then(res => setLeaveHistory(res.data || []))
      .catch(() => setLeaveHistory([]));
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitLeaveRequest({ date: leaveDate, reason });
      toast.success('Leave request submitted');
      setLeaveDate('');
      setReason('');
      getLeaveHistory().then(res => setLeaveHistory(res.data || []));
    } catch {
      toast.error('Failed to submit leave request');
    }
  };

  const startIdx = (page - 1) * perPage;
  const pageData = leaveHistory.slice(startIdx, startIdx + perPage);
  const totalPages = Math.ceil(leaveHistory.length / perPage);

  return (
    <div className="leave-tab-grid">
      {/* Leave Request Form */}
      <div className="leave-form-card">
        <h3>Leave Request Form</h3>
        <form className="leave-form" onSubmit={handleLeaveSubmit}>
          <label>
            Leave Date
            <input
              type="date"
              value={leaveDate}
              onChange={e => setLeaveDate(e.target.value)}
              placeholder="dd / mm / yyyy"
              required
              className="calendar-input" // style as per image1 in css
            />
          </label>
          <label>
            Reason
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Enter the reason for leave"
              required
            />
          </label>
          <button type="submit" className="apply-btn">Apply Leave</button>
        </form>
      </div>
      {/* Leave History Table */}
      <div className="leave-history-card">
        <h4>Leave History</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>No leave history</td>
              </tr>
            ) : (
              pageData.map((leave, idx) => (
                <tr key={idx}>
                  <td>{leave.date}</td>
                  <td>{leave.reason}</td>
                  <td>{leave.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination capsule">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="capsule-btn"
            >
              Previous
            </button>
            <span className="capsule-page">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="capsule-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const HolidayTab = () => {
  // Pagination logic for holiday calendar
  const holidays = [
    { date: '2025-05-01', name: 'May Day' },
    { date: '2025-08-15', name: 'Independence Day' },
    { date: '2025-08-27', name: 'Ganesh Chaturthi' },
    { date: '2025-10-02', name: 'Gandhi Jayanti' },
    { date: '2025-10-20', name: 'Diwali' },
    { date: '2025-12-25', name: 'Christmas' },
    { date: '2025-01-26', name: 'Republic Day' },
    { date: '2025-03-08', name: 'Maha Shivratri' },
    { date: '2025-04-14', name: 'Ambedkar Jayanti' },
    { date: '2025-06-06', name: 'Eid al-Fitr' },
    { date: '2025-11-14', name: 'Children\'s Day' },
    { date: '2025-11-01', name: 'Kannada Rajyotsava' },
  ];
  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.ceil(holidays.length / perPage);
  const pageData = holidays.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="card holiday-card">
      <h3>Holiday Calendar</h3>
      <table className="holiday-table">
        <thead>
          <tr><th>Date</th><th>Holiday</th></tr>
        </thead>
        <tbody>
          {pageData.map((h, idx) => (
            <tr key={idx}>
              <td>{h.date}</td>
              <td>{h.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination capsule">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="capsule-btn"
          >
            Previous
          </button>
          <span className="capsule-page">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="capsule-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const ProfileTab = ({ employee, setEditMode, editMode, onSave }) => (
  <div className="card profile-view">
    <div className="profile-avatar-large">👤</div>
    {!editMode ? (
      <>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Email:</strong> {employee.email}</p>
        <p><strong>Position:</strong> {employee.position}</p>
        <p><strong>Department:</strong> {employee.department}</p>
        <p><strong>Blood Group:</strong> {employee.blood_group}</p>
        <p><strong>Date of Joining:</strong> {employee.join_date}</p>
        <div className="edit-button-container">
          <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      </>
    ) : (
      <form onSubmit={onSave} className="profile-form">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="close-btn"
            onClick={() => setEditMode(false)}
            title="Cancel"
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: "#888",
              cursor: "pointer",
              position: "absolute",
              right: 16,
              top: 12,
            }}
          >
            <FaTimes />
          </button>
        </div>
        <label>Name
          <input type="text" name="name" defaultValue={employee.name} placeholder="Enter your full name" required />
        </label>
        <label>Email
          <input type="email" name="email" defaultValue={employee.email} placeholder="Enter your email address" required />
        </label>
        <label>Position
          <input type="text" name="position" defaultValue={employee.position} placeholder="Enter your job title" required />
        </label>
        <label>Department
          <input type="text" name="department" defaultValue={employee.department} placeholder="Enter your department" required />
        </label>
        <label>Date of Joining
          <input type="date" name="doj" defaultValue={employee.doj} placeholder="Select your joining date" required />
        </label>
        <label>Blood Group
          <input type="text" name="bloodGroup" defaultValue={employee.bloodGroup} placeholder="E.g., O+, A-, B+" required />
        </label>
        <div className="modal-buttons">
          <button type="submit">Update</button>
        </div>
      </form>
    )}
  </div>
);

const HistoryTab = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory();
        setHistory(res.data); // Assumes array of { date, checkin, checkout }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load attendance history');
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="card">
      <h3>Attendance History</h3>
      <table>
        <thead>
          <tr><th>Date</th><th>Check-in</th><th>Check-out</th></tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr><td colSpan="3">No records found</td></tr>
          ) : (
            history.map((record, i) => (
              <tr key={i}>
                <td>{record.date}</td>
                <td>{record.checkin || '—'}</td>
                <td>{record.checkout || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};


const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState({ leavesTaken: 0, pendingRequests: 0 });
  const [employee, setEmployee] = useState({ name: '', email: '', position: '', department: '', doj: '', bloodGroup: '' });
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();
  const leavesLeft = 20 - summary.leavesTaken;
  const holidays = [
    { name: 'May Day', date: '2025-05-01' },
    { name: 'Diwali', date: '2025-10-20' }
  ];
  const today = new Date();
  const nextHoliday = holidays.find(h => new Date(h.date) >= today);

  useEffect(() => {
    getProfile().then(res => setEmployee(res.data)).catch(() => toast.error('Failed to load profile'));
    getEmployeeSummary().then(res => setSummary(res.data)).catch(() => toast.error('Failed to load dashboard data'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updated = {
      name: form.name.value,
      email: form.email.value,
      position: form.position.value,
      department: form.department.value,
      doj: form.doj.value,
      bloodGroup: form.bloodGroup.value,
    };
    try {
      await updateEmployeeProfile(updated);
      setEmployee(updated);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); // Close after selecting
        }}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content">
          <SummaryCards summary={summary} leavesLeft={leavesLeft} nextHoliday={nextHoliday} employee={employee} />
          {activeTab === 'dashboard' && <DashboardTab employee={employee} />}
          {activeTab === 'profile' && <ProfileTab employee={employee} setEditMode={setEditMode} editMode={editMode} onSave={handleProfileSave} />}
          {activeTab === 'attendance' && <AttendanceTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'leave' && <LeaveTab />}
          {activeTab === 'holiday' && <HolidayTab />}
          <ToastContainer />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
