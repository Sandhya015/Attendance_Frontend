import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  getAllRecords, getAllLeaveRequests,
  updateLeaveStatus, getPendingCheckins,
  approveCheckin, rejectCheckin, addEmployee
} from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { FaChartBar, FaClock, FaUserPlus, FaCalendarAlt, FaFileUpload, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logooo.jpg'; // Make sure this path is correct
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";



const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => (
  <aside className="admin-sidebar">
    <div className="admin-sidebar-logo">Admin</div>
    <ul>
      <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}><FaChartBar /> Attendance</li>
      <li className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}><FaClock /> Pending Check-ins</li>
      <li className={activeTab === 'leave' ? 'active' : ''} onClick={() => setActiveTab('leave')}><FaCalendarAlt /> Leave Requests</li>
      <li className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}><FaFileUpload /> Upload Attendance</li>
      <li className={activeTab === 'add' ? 'active' : ''} onClick={() => setActiveTab('add')}><FaUserPlus /> Add Employee</li>
      <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
    </ul>
  </aside>
);

const TopNavbar = () => (
  <header className="admin-dashboard-navbar">
    <div className="admin-navbar-title">Admin Dashboard</div>
    <img src={logo} alt="Logo" className="admin-navbar-logo" />
  </header>
);

const SummaryCards = ({ attendanceStats, leaveRequests, pendingCheckins }) => (
  <div className="admin-summary-cards">
    <div className="admin-card"><h4>Pending Check-ins</h4><p>{pendingCheckins.length}</p></div>
    <div className="admin-card"><h4>Today's Present</h4><p>{attendanceStats.present}</p></div>
    <div className="admin-card"><h4>Today's On Leave</h4><p>{attendanceStats.leave}</p></div>
    <div className="admin-card"><h4>Pending Leave Requests</h4><p>{leaveRequests.filter(l => l.status === 'Pending').length}</p></div>
  </div>
);

const bloodGroup = [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];

const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filters, setFilters] = useState({ email: '', fromDate: '', toDate: '' });
  const [activeTab, setActiveTab] = useState('attendance');
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(5);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, leave: 0, absent: 0 });
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [newEmployee, setNewEmployee] = useState({
    name: '', email: '', join_date: '', password: '', department: '', position: '', bloodGroup: ''
  });
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchRecords = useCallback(async () => {
    try {
      let apiFilters = {};
      if (filters.email) apiFilters.email = filters.email;
      if (filters.fromDate) apiFilters.fromDate = filters.fromDate;
      if (filters.toDate) apiFilters.toDate = filters.toDate;
      const res = await getAllRecords(apiFilters);
      setRecords(res.data);
    } catch (err) { console.error(err); }
  }, [filters.email, filters.fromDate, filters.toDate]);

  const fetchLeaveRequests = useCallback(async () => {
    try { const res = await getAllLeaveRequests(); setLeaveRequests(res.data); } catch (err) { console.error(err); }
  }, []);

  const fetchPendingCheckins = useCallback(async () => {
    try { const res = await getPendingCheckins(); setPendingCheckins(res.data); } catch (err) { console.error(err); }
  }, []);

  const fetchTotalEmployees = useCallback(async () => {
    try {
      const res = await fetch('https://backend-api-corrected-1.onrender.com/admin/total-employees', {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setTotalEmployees(data.total_employees);
    } catch (err) {
      console.error('Failed to fetch total employees:', err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await fetchRecords();
    await fetchLeaveRequests();
    await fetchPendingCheckins();
    await fetchTotalEmployees();
  }, [fetchRecords, fetchLeaveRequests, fetchPendingCheckins, fetchTotalEmployees]);

  const calculateAttendance = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const present = records.filter(r => r.date === today && r.checkin).length;
    const leave = leaveRequests.filter(l => l.date === today).length;
    const absent = Math.max(0, totalEmployees - (present + leave));
    setAttendanceStats({ present, leave, absent });
  }, [records, leaveRequests, totalEmployees]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);
  useEffect(() => { if (totalEmployees > 0) calculateAttendance(); }, [records, leaveRequests, totalEmployees, calculateAttendance]);

  // const handleCheckinDecision = async (id, status) => {
  //   try { await approveCheckin(id, status); fetchPendingCheckins(); fetchRecords(); } catch (err) { console.error("Failed to update check-in:", err); }
  // };

  const handleCheckinDecision = async (id, status) => {
    try {
      if (status === 'Rejected') {
        await rejectCheckin(id);
      } else {
        await approveCheckin(id, status);
      }
      fetchPendingCheckins();
      fetchRecords();
      toast.success(`Check-in ${status.toLowerCase()} successfully.`);
    } catch (err) {
      console.error("Failed to update check-in:", err);
      toast.error("Failed to update check-in.");
    }
  };


  const handleExport = async () => {
    try {
      const queryParts = [];
      if (filters.email.trim() !== '') queryParts.push(`email=${encodeURIComponent(filters.email.trim())}`);
      if (filters.fromDate.trim() !== '') queryParts.push(`fromDate=${encodeURIComponent(filters.fromDate.trim())}`);
      if (filters.toDate.trim() !== '') queryParts.push(`toDate=${encodeURIComponent(filters.toDate.trim())}`);
      const query = queryParts.length ? `?${queryParts.join('&')}` : '';
      const res = await fetch(`https://backend-api-corrected-1.onrender.com/admin/export${query}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.status === 404) return toast.error("No matching records found to export!");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export attendance!");
    }
  };

  const handleLeaveDecision = async (id, status) => {
    try { await updateLeaveStatus(id, status); fetchLeaveRequests(); } catch (err) { console.error('Failed to update leave status:', err); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleUploadAttendance = async () => {
    if (!fileInputRef.current?.files[0]) return toast.error('Please select a file first!');
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    try {
      await fetch('https://backend-api-corrected-1.onrender.com/admin/upload-attendance', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      toast.success('Attendance uploaded successfully!');
      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload attendance.');
    }
  };

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.name || !newEmployee.email || !newEmployee.join_date || !newEmployee.password || !newEmployee.department || !newEmployee.position || !newEmployee.bloodGroup) {
        toast.warning("Please fill out all fields.");
        return false;
      }
      await addEmployee(newEmployee);
      toast.success("Employee added successfully!");
      setNewEmployee({ name: '', email: '', join_date: '', password: '', department: '', position: '', bloodGroup: '' });
      return true;
    } catch (err) {
      console.error("Error adding employee:", err);
      toast.error("Failed to add employee.");
      return false;
    }
  };

  const handleEmployeeFormSubmit = async (e) => {
    e.preventDefault();
    const { name, email, join_date, password, department, position, bloodGroup } = newEmployee;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !join_date || !password || !department || !position || !bloodGroup || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const success = await handleAddEmployee();
    if (success) {
      setNewEmployee({ name: '', email: '', join_date: '', password: '', department: '', position: '', bloodGroup: '' });
      setConfirmPassword('');
    }
  };

  // const filteredRecords = records.filter(record => {
  //   const recordDate = record.date;
  //   let afterFrom = true, beforeTo = true;
  //   if (filters.fromDate) afterFrom = recordDate >= filters.fromDate;
  //   if (filters.toDate) beforeTo = recordDate <= filters.toDate;
  //   return afterFrom && beforeTo;
  // });

  const filteredRecords = records
    .filter(record => {
      const recordDate = record.date;
      let afterFrom = true, beforeTo = true;
      if (filters.fromDate) afterFrom = recordDate >= filters.fromDate;
      if (filters.toDate) beforeTo = recordDate <= filters.toDate;
      return afterFrom && beforeTo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending


  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCheckins, setSelectedCheckins] = useState([]);


  const handleSelectAll = () => {
    if (selectedCheckins.length === pendingCheckins.length) {
      setSelectedCheckins([]);
    } else {
      const allIds = pendingCheckins.map(item => item._id);
      setSelectedCheckins(allIds);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedCheckins(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };


  // const handleBulkDecision = async (status) => {
  //   if (selectedCheckins.length === 0) {
  //     toast.warning("Select at least one check-in.");
  //     return;
  //   }

  //   try {
  //     await Promise.all(
  //       selectedCheckins.map(id => approveCheckin(id, status))
  //     );
  //     toast.success(`All selected check-ins ${status.toLowerCase()}ed.`);
  //     setSelectedCheckins([]);
  //     fetchPendingCheckins();
  //     fetchRecords();
  //   } catch (err) {
  //     toast.error("Bulk operation failed.");
  //     console.error(err);
  //   }
  // };

  const handleBulkDecision = async (status) => {
    if (selectedCheckins.length === 0) {
      toast.warning("Select at least one check-in.");
      return;
    }

    try {
      await Promise.all(
        selectedCheckins.map(id =>
          status === 'Rejected' ? rejectCheckin(id) : approveCheckin(id, status)
        )
      );
      toast.success(`All selected check-ins ${status.toLowerCase()}ed.`);
      setSelectedCheckins([]);
      fetchPendingCheckins();
      fetchRecords();
    } catch (err) {
      console.error("Bulk operation failed:", err);
      toast.error("Bulk operation failed.");
    }
  };


  return (
    <div className="admin-dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <div className="admin-main-area">
        <TopNavbar />
        <main className="admin-main-content">
          {activeTab === 'attendance' && (
            <>
              <div className="admin-filter-group">
                <input
                  type="email"
                  placeholder="Filter by Email"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="From Date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                  style={{ minWidth: 120 }}
                />
                <input
                  type="date"
                  placeholder="To Date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                  style={{ minWidth: 120 }}
                />
                <button onClick={fetchRecords}>Search</button>
                <button onClick={handleExport}>Export CSV</button>
              </div>

              <div className="admin-summary-section">
                <SummaryCards attendanceStats={attendanceStats} leaveRequests={leaveRequests} pendingCheckins={pendingCheckins} />
              </div>

              <div className="admin-records">
                <h3>Attendance Records</h3>
                <table>
                  <thead>
                    <tr><th>Email</th><th>Date</th><th>Check-In</th><th>Check-Out</th></tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, i) => (
                      <tr key={i}>
                        <td>{record.email}</td>
                        <td>{record.date}</td>
                        <td>{record.checkin || '—'}</td>
                        <td>{record.checkout || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="admin-pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                  <span>{currentPage}</span>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                </div>
              </div>
            </>
          )}

          {/* {activeTab === 'pending' && (
            <div className="admin-pending-checkins">
              <h3>Pending Check-In Approvals</h3>
              <table>
                <thead>
                  <tr><th>Email</th><th>Date</th><th>Check-In Time</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pendingCheckins.map((item, i) => (
                    <tr key={i}>
                      <td>{item.email}</td>
                      <td>{item.date}</td>
                      <td>{item.checkin_time || '—'}</td>
                      <td>
                        <button className="admin-approve-btn" onClick={() => handleCheckinDecision(item._id, 'Accepted')}>Accept</button>
                        <button className="admin-reject-btn" onClick={() => handleCheckinDecision(item._id, 'Rejected')}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}



          {activeTab === 'pending' && (
            <div className="admin-pending-checkins">
              <h3>Pending Check-In Approvals</h3>

              <div style={{ marginBottom: '10px' }}>
                <button className="admin-approve-btn" onClick={() => handleBulkDecision('Accepted')}>Accept Selected</button>
                <button className="admin-reject-btn" onClick={() => handleBulkDecision('Rejected')}>Reject Selected</button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCheckins.length === pendingCheckins.length && pendingCheckins.length > 0}
                          onChange={handleSelectAll}
                        />
                        <span style={{ fontWeight: 'normal', fontSize: '14px' }}>Select All</span>
                      </label>
                    </th>
                    <th>Email</th>
                    <th>Date</th>
                    <th>Check-In Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingCheckins.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCheckins.includes(item._id)}
                          onChange={() => handleCheckboxChange(item._id)}
                        />
                      </td>
                      <td>{item.email}</td>
                      <td>{item.date}</td>
                      <td>{item.checkin_time || '—'}</td>
                      <td>
                        <button className="admin-approve-btn" onClick={() => handleCheckinDecision(item._id, 'Accepted')}>Accept</button>
                        <button className="admin-reject-btn" onClick={() => handleCheckinDecision(item._id, 'Rejected')}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


          {activeTab === 'leave' && (
            <>
              <div className="admin-summary-cards">
                <div className="admin-card total">Total Requests: {leaveRequests.length}</div>
                <div className="admin-card pending">Pending: {leaveRequests.filter(l => l.status === 'Pending').length}</div>
                <div className="admin-card accepted">Accepted: {leaveRequests.filter(l => l.status === 'Accepted').length}</div>
                <div className="admin-card rejected">Rejected: {leaveRequests.filter(l => l.status === 'Rejected').length}</div>
              </div>
              <table>
                <thead><tr><th>Email</th><th>Date</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {leaveRequests.map((leave, i) => (
                    <tr key={i}>
                      <td>{leave.email}</td>
                      <td>{leave.date}</td>
                      <td>{leave.reason}</td>
                      <td>{leave.status}</td>
                      <td>
                        {leave.status === 'Pending' ? (
                          <>
                            <button className="admin-approve-btn" onClick={() => handleLeaveDecision(leave._id, 'Accepted')}>Accept</button>
                            <button className="admin-reject-btn" onClick={() => handleLeaveDecision(leave._id, 'Rejected')}>Reject</button>
                          </>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeTab === 'upload' && (
            <div className="admin-upload-attendance">
              <h3>Upload Attendance CSV</h3>

              <div className="upload-controls">
                <label htmlFor="attendance-upload" className="upload-label">
                  <FaUpload style={{ marginRight: '8px' }} />
                  Choose CSV File
                </label>
                <input
                  id="attendance-upload"
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <button onClick={handleUploadAttendance}>Upload</button>
              </div>

              {selectedFile && (
                <div className="selected-file">📄 {selectedFile.name}</div>
              )}
            </div>
          )}


          {activeTab === 'add' && (
            <div className="admin-add-employee">
              <h3>Add New Employee</h3>
              <form onSubmit={handleEmployeeFormSubmit} autoComplete="off">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newEmployee.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setNewEmployee({ ...newEmployee, name: value });
                    }
                  }}
                  required
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />

                <label style={{ fontSize: "14px", marginBottom: "5px", display: "block", color: "#555" }}>
                  Date of Joining
                </label>
                <input
                  type="date"
                  value={newEmployee.join_date}
                  onChange={(e) => setNewEmployee({ ...newEmployee, join_date: e.target.value })}
                  required
                />

                {/* Password Field */}
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={newEmployee.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewEmployee({ ...newEmployee, password: value });
                    }}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$"
                    title="Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
                    required
                    style={{ width: "100%", paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "18px"
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Confirm Password Field */}
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setConfirmPassword(value);
                      if (newEmployee.password !== value) {
                        setPasswordError("Passwords do not match");
                      } else {
                        setPasswordError("");
                      }
                    }}
                    required
                    style={{ width: "100%", paddingRight: "40px" }}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "18px"
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Password Match Error */}
                {passwordError && (
                  <div style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                    {passwordError}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Department"
                  value={newEmployee.department}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setNewEmployee({ ...newEmployee, department: value });
                    }
                  }}
                  required
                />

                <input
                  type="text"
                  placeholder="Position"
                  value={newEmployee.position}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setNewEmployee({ ...newEmployee, position: value });
                    }
                  }}
                  required
                />

                <select
                  value={newEmployee.bloodGroup}
                  onChange={e => setNewEmployee({ ...newEmployee, bloodGroup: e.target.value })}
                  required
                  className="admin-blood-dropdown"
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroup.filter(bg => bg !== "").map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>

                <button type="submit">
                  Add Employee
                </button>
              </form>
            </div>
          )}

          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
