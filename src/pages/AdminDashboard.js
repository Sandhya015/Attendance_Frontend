import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  getAllRecords, getAllLeaveRequests,
  updateLeaveStatus, getPendingCheckins,
  approveCheckin, rejectCheckin, addEmployee, getBiometricLogs, getBiometricEmployees, getWeeklyLowBiometricHours,withdrawLeaveRequest
} from '../services/api';
import API from '../services/api';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { FaChartBar, FaClock, FaUserPlus, FaCalendarAlt, FaFileUpload, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logooo.jpg';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
import { FaUserEdit, FaFingerprint } from 'react-icons/fa';
import { getAllHolidays, addHoliday, deleteHoliday } from '../services/api';


const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => (
  <aside className="admin-sidebar">
    <div className="admin-sidebar-logo">Admin</div>
    <ul>
      <li className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}><FaChartBar /> Attendance</li>
      <li className={activeTab === 'biometric' ? 'active' : ''} onClick={() => setActiveTab('biometric')}><FaFingerprint /> Biometric Logs</li>
      <li className={activeTab === 'editEmployee' ? 'active' : ''} onClick={() => setActiveTab('editEmployee')}><FaUserEdit /> Edit Employee</li>
      <li className={activeTab === 'biometricEmployees' ? 'active' : ''} onClick={() => setActiveTab('biometricEmployees')}><FaFingerprint /> Biometric Employees</li>
      <li className={activeTab === 'holidays' ? 'active' : ''} onClick={() => setActiveTab('holidays')}><FaCalendarAlt /> Manage Holidays</li>
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



const bloodGroup = [
  "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"
];

const AdminDashboard = () => {
  const [records, setRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filters, setFilters] = useState({
    email: '',
    fromDate: '',
    toDate: '',
    date: '',
    employeeId: '',
  });

  const [activeTab, setActiveTab] = useState('attendance');
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, leave: 0, absent: 0 });
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [newEmployee, setNewEmployee] = useState({
    emp_code: '', name: '', email: '', reporting_to: [], join_date: '', password: '', department: '', position: '', bloodGroup: '', role: ''
  });
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const [biometricEmployees, setBiometricEmployees] = useState([]);
  const [loadingBioEmployees, setLoadingBioEmployees] = useState(false);

  const [bioCurrentPage, setBioCurrentPage] = useState(1);
  const bioPerPage = 10;
  const bioTotalPages = Math.ceil(biometricEmployees.length / bioPerPage);
  const bioCurrentEmployees = biometricEmployees.slice(
    (bioCurrentPage - 1) * bioPerPage,
    bioCurrentPage * bioPerPage
  );
  const [loadingPending, setLoadingPending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // for button actions
  const [loadingCheckinId, setLoadingCheckinId] = useState(null); // for individual row
  const [bulkLoading, setBulkLoading] = useState(false); // for bulk action
  const [loadingLeaveId, setLoadingLeaveId] = useState(null); // new
  const [uploading, setUploading] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);





  // const handleSearchBiometricEmployee = async () => {
  //   try {
  //     const id = searchEmpId.trim();
  //     const res = await getBiometricEmployees(id);
  //     setBiometricEmployees(res.data || []);
  //     setBioCurrentPage(1);
  //   } catch (err) {
  //     console.error("Search Error:", err);
  //     toast.error(err.response?.data?.msg || "Failed to fetch records");
  //   }
  // };


  const fetchBiometricEmployees = async () => {
    setLoadingBioEmployees(true);
    try {
      const res = await getBiometricEmployees(searchEmpId);
      setBiometricEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch biometric employees", err);
      toast.error("Failed to fetch biometric employees");
    } finally {
      setLoadingBioEmployees(false);
    }
  };



  useEffect(() => {
    if (activeTab === 'biometricEmployees') {
      fetchBiometricEmployees();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'biometric') {
      setLoadingLogs(true); // Start loading as soon as tab becomes active
      fetchBiometricLogs(); // It already sets loading false in finally
    }
  }, [activeTab]);





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
    try {
      const res = await getAllLeaveRequests();
      const sorted = (res.data || []).sort(
        (a, b) => new Date(b.from_date) - new Date(a.from_date)
      );
      setLeaveRequests(sorted);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
      toast.error("Failed to load leave requests");
    }
  }, []);


  const fetchPendingCheckins = useCallback(async () => {
    setLoadingPending(true); // Start loading
    try {
      const res = await getPendingCheckins();
      setPendingCheckins(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch pending check-ins");
    } finally {
      setLoadingPending(false); // Stop loading
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingCheckins();
    }
  }, [activeTab, fetchPendingCheckins]);


  const [biometricLogs, setBiometricLogs] = useState([]);
  const [searchEmpId, setSearchEmpId] = useState('');
  const [searchDate] = useState('');
  const logsPerPage = 10;
  const [currentPageBiometric, setCurrentPageBiometric] = useState(1); const indexOfLastLog = currentPageBiometric * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = biometricLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalLogPages = Math.ceil(biometricLogs.length / logsPerPage);


  const fetchBiometricLogs = async (customFilters = filters) => {
    setLoadingLogs(true); // ← Start loader
    try {
      const params = {};
      if (customFilters.date) params.date = customFilters.date;
      if (customFilters.employeeId) params.employee_id = customFilters.employeeId;

      const res = await getBiometricLogs(params);
      setBiometricLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch biometric logs", err);
      toast.error("Failed to load biometric logs");
    } finally {
      setLoadingLogs(false); // ← Stop loader
    }
  };




  useEffect(() => {
    if (activeTab === 'biometric') {
      handleSearch(); // fetches all logs if no filters are set
    }
  }, [activeTab]);




  const fetchAllData = useCallback(async () => {
    await fetchRecords();
    await fetchLeaveRequests();
    await fetchPendingCheckins();

  }, [fetchRecords, fetchLeaveRequests, fetchPendingCheckins]);

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
    setLoadingCheckinId(id); // Show loader for the clicked row
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
    } finally {
      setLoadingCheckinId(null); // Reset loading state
    }
  };


  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch('https://backend-api-corrected-1.onrender.com/admin/employees', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await res.json();
      console.log("Employee API Response:", data);

      // ✅ Since data IS an array
      setEmployees(data);

    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);





  useEffect(() => {
    if (activeTab === 'editEmployee') {
      fetchEmployees();
    }
  }, [activeTab, fetchEmployees]);


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
    setLoadingLeaveId(id); // Start loading for this leave ID
    try {
      await updateLeaveStatus(id, status);
      fetchLeaveRequests(); // Refresh list after update
    } catch (err) {
      console.error('Failed to update leave status:', err);
      toast.error('Failed to update leave status.');
    } finally {
      setLoadingLeaveId(null); // Stop loading
    }
  };


  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleUploadAttendance = async () => {
    if (!fileInputRef.current?.files[0]) {
      toast.error('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    setUploading(true); // Start loading
    try {
      await API.post('/admin/upload-attendance', formData);
      toast.success('Attendance uploaded successfully!');
      fetchRecords(); // Refresh the data
    } catch (err) {
      console.error('Error uploading attendance:', err);
      toast.error('Failed to upload attendance.');
    } finally {
      setUploading(false); // Stop loading
    }
  };

  const handleAddEmployee = async () => {
    setAddingEmployee(true);
    try {
      const { name, email, join_date, password, department, position, bloodGroup, emp_code, reporting_to } = newEmployee;

      if (!name || !email || !join_date || !password || !department || !position || !bloodGroup || !emp_code || !reporting_to.length) {
        toast.warning("Please fill out all fields.");
        return false;
      }

      await addEmployee(newEmployee);
      toast.success("Employee added successfully!");

      setNewEmployee({
        emp_code: '', name: '', email: '', join_date: '', password: '',
        department: '', position: '', bloodGroup: '', reporting_to: [], role: ''
      });

      return true;
    } catch (err) {
      console.error("Error adding employee:", err);
      toast.error("Failed to add employee.");
      return false;
    } finally {
      setAddingEmployee(false);
    }
  };



  const handleEmployeeFormSubmit = async (e) => {
    e.preventDefault();
    const {
      emp_code, name, email, join_date, password,
      department, position, bloodGroup,
      reporting_to
    } = newEmployee;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emp_code || !name || !email || !join_date || !password ||
      !department || !position || !bloodGroup || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (!reporting_to.length) {
      toast.error("Please enter at least one Reporting To email.");
      return;
    }

    const invalidReports = reporting_to.filter(e => !emailRegex.test(e));
    if (invalidReports.length) {
      toast.error(`Invalid Reporting To email(s): ${invalidReports.join(', ')}`);
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const success = await handleAddEmployee();
    if (success) {
      setNewEmployee({
        emp_code: '', name: '', email: '', join_date: '', password: '',
        department: '', position: '', bloodGroup: '',
        reporting_to: []
      });
      setConfirmPassword('');
    }
  };

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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [leavePage, setLeavePage] = useState(1);
  const leavePerPage = 5;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyFrom, setWeeklyFrom] = useState('');
  const [weeklyTo, setWeeklyTo] = useState('');





  const totalLeavePages = Math.ceil(leaveRequests.length / leavePerPage);
  const paginatedLeaveRequests = leaveRequests.slice(
    (leavePage - 1) * leavePerPage,
    leavePage * leavePerPage
  );




  useEffect(() => {
    if (activeTab === 'holidays') {
      fetchHolidays();  // Call it when tab is activated
    }
  }, [activeTab]);


  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const res = await getAllHolidays();
      setHolidays(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Error loading holidays");
    } finally {
      setLoadingHolidays(false);
    }
  };




  const handleAddHoliday = async () => {
    if (!newHoliday.date || !newHoliday.name) {
      toast.warning("Please enter both date and name");
      return;
    }

    try {
      await addHoliday(newHoliday);
      toast.success("Holiday added");
      setNewHoliday({ date: '', name: '' });
      fetchHolidays(); // refresh
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Holiday for this date already exists");
      } else {
        toast.error("Failed to add holiday");
      }
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await deleteHoliday(id);
      toast.success("Holiday deleted");
      fetchHolidays();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete holiday");
    }
  };

  const handleSearch = async () => {
    try {
      const filters = {};
      if (searchDate) filters.date = searchDate;
      if (searchEmpId) filters.employee_id = searchEmpId;

      const res = await getBiometricLogs(filters);
      setBiometricLogs(res.data || []);
    } catch (err) {
      toast.error('Failed to search logs');
    }
  };

  const currentEmployees = employees.slice(indexOfFirst, indexOfLast);

  const handleSelectAll = () => {
    if (selectedCheckins.length === pendingCheckins.length) {
      setSelectedCheckins([]);
    } else {
      const allIds = pendingCheckins.map(item => item._id);
      setSelectedCheckins(allIds);
    }
  };

  const handleClearFilters = () => {
    const cleared = { date: '', employeeId: '' };
    setFilters(cleared);
    fetchBiometricLogs(cleared);
  };


const handleWeeklyReport = async () => {
  if (!weeklyFrom || !weeklyTo) {
    toast.warning("Please select both From and To dates.");
    return;
  }

  // Convert to YYYY-MM-DD format explicitly
  const fromDateFormatted = new Date(weeklyFrom).toISOString().split("T")[0];
  const toDateFormatted = new Date(weeklyTo).toISOString().split("T")[0];

  console.log("Sending dates:", fromDateFormatted, toDateFormatted);

  setLoadingLogs(true);
  setShowWeeklyModal(false);

  try {
    const res = await getWeeklyLowBiometricHours({
      from_date: fromDateFormatted,
      to_date: toDateFormatted,
    });

    setBiometricLogs(res.data || []);
    setCurrentPageBiometric(1);
  } catch (err) {
    toast.error("Failed to fetch weekly report");
  } finally {
    setLoadingLogs(false);
  }
};






  const handleCheckboxChange = (id) => {
    setSelectedCheckins(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };


  const handleBulkDecision = async (status) => {
    if (selectedCheckins.length === 0) {
      toast.warning("Select at least one check-in.");
      return;
    }

    setBulkLoading(true);
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
    } finally {
      setBulkLoading(false);
    }
  };


  const [editingEmp, setEditingEmp] = useState(null);

  const openEditModal = (emp) => {
    setEditingEmp(emp);
  };

  const handleEditSubmit = async () => {
    try {
      await API.put(`/admin/employees/${editingEmp._id}`, editingEmp);
      toast.success("Employee updated!");
      setEditingEmp(null);
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to update employee.");
      console.error("Error updating employee:", err);
    }
  };


  const handleDeleteEmployee = async (empId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/employees/${empId}`);

      toast.success("Employee deleted successfully");
      fetchEmployees(); // Refresh the list
    } catch (err) {
      console.error("Error deleting employee:", err);

      // Show server message if available
      const message = err.response?.data?.msg || "Server error while deleting";
      toast.error(message);
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

              {/* <div className="admin-summary-section">
                <SummaryCards attendanceStats={attendanceStats} leaveRequests={leaveRequests} pendingCheckins={pendingCheckins} />
              </div> */}

              <div className="admin-records">
                <h3>Attendance Records</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, i) => {
                      const hours = record.hours_worked || 0;
                      let status = 'Absent';
                      if (hours >= 9) status = 'Present';
                      else if (hours >= 4) status = 'Half-Day';
                      else if (hours > 0) status = 'Full-Day Leave';

                      return (
                        <tr key={i}>
                          <td>{record.email}</td>
                          <td>{record.date}</td>
                          <td>{record.checkin || '—'}</td>
                          <td>{record.checkout || '—'}</td>
                          <td>{hours ? hours.toFixed(2) + ' hrs' : '—'}</td>
                          <td>
                            <span className={
                              status === "Present" ? "status-full" :
                                status === "Half-Day" ? "status-half" : "status-leave"
                            }>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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

          {activeTab === 'biometric' && (
            <div className="admin-biometric-logs">
              <h3>Biometric Logs</h3>

              <div className="admin-filter-group">
                <input
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  placeholder="Filter by Date"
                />
                <input
                  type="number"
                  placeholder="Filter by Employee ID"
                  value={filters.employeeId || ''}
                  onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                />
                <button onClick={() => fetchBiometricLogs()} disabled={loadingLogs}>
                  {loadingLogs ? 'Searching...' : 'Search'}
                </button>

                <button
                  onClick={() => setShowWeeklyModal(true)}
                  style={{ backgroundColor: '#3498db', color: '#fff', marginLeft: '8px' }}
                  disabled={loadingLogs}
                >
                  Weekly Report
                </button>


                <button
                  onClick={handleClearFilters}
                  style={{ backgroundColor: '#ccc', marginLeft: '8px' }}
                  disabled={loadingLogs}
                >
                  Clear
                </button>
              </div>

              {loadingLogs ? (
                <div className="overlay-loader">
                  <div className="spinner"></div>
                  <p>Loading biometric logs...</p>
                </div>
              ) : biometricLogs.length === 0 ? (
                <p>No biometric records found.</p>
              ) : (
                <table className="biometric-logs-table">
                  <thead>
                    {biometricLogs[0]?.TotalHours !== undefined ? (
                      <tr>
                        <th>Employee ID</th>
                        <th>Total Hours Worked</th>
                      </tr>
                    ) : (
                      <tr>
                        <th>Attendance Date</th>
                        <th>Employee ID</th>
                        <th>In Time</th>
                        <th>Out Time</th>
                        <th>Duration (Hrs)</th>
                        <th>Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {currentLogs.map((log, i) =>
                      log.TotalHours !== undefined ? (
                        // Weekly Report Row
                        <tr key={i}>
                          <td>{log.EmployeeId}</td>
                          <td>{log.TotalHours}</td>
                        </tr>
                      ) : (
                        // Regular Log Row
                        <tr key={i}>
                          <td>{log.AttendanceDate}</td>
                          <td>{log.EmployeeId}</td>
                          <td>{log.InTime || '—'}</td>
                          <td>{log.OutTime || '—'}</td>
                          <td>{log.DurationHours || '—'}</td>
                          <td>{log.Status || '-'}</td>
                        </tr>
                      )
                    )}
                  </tbody>

                  {showWeeklyModal && (
                    <div className="modal-overlay">
                      <div className="weekly-modal">
                        <h3>📊 Weekly Report</h3>
                        <div className="input-group">
                          <label>From Date</label>
                          <input
                            type="date"
                            value={weeklyFrom}
                            onChange={(e) => setWeeklyFrom(e.target.value)}
                          />
                        </div>
                        <div className="input-group">
                          <label>To Date</label>
                          <input
                            type="date"
                            value={weeklyTo}
                            onChange={(e) => setWeeklyTo(e.target.value)}
                          />
                        </div>
                        <div className="weekly-buttons">
                          <button
                            className="btn-primary"
                            onClick={handleWeeklyReport}
                            disabled={loadingLogs || !weeklyFrom || !weeklyTo}
                          >
                            {loadingLogs ? "Generating..." : "Generate Report"}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => setShowWeeklyModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </table>
              )}

              <div className="pagination-classic">
                <button
                  className="page-btn-classic"
                  disabled={currentPageBiometric === 1}
                  onClick={() => setCurrentPageBiometric(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>

                <span className="page-number">{currentPageBiometric}</span>

                <button
                  className="page-btn-classic next"
                  disabled={currentPageBiometric === totalLogPages}
                  onClick={() => setCurrentPageBiometric(prev => Math.min(prev + 1, totalLogPages))}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {activeTab === 'biometricEmployees' && (
            <div className="admin-biometric-employees">
              <h3>Biometric Employees</h3>

              <div className="admin-filter-group">
                <input
                  type="number"
                  placeholder="Search by Employee ID"
                  value={searchEmpId}
                  onChange={(e) => setSearchEmpId(e.target.value)}
                />
                <button onClick={fetchBiometricEmployees}>Search</button>
              </div>

              {loadingBioEmployees ? (
                <div className="overlay-loader">
                  <div className="spinner"></div>
                  <p>Loading biometric employees...</p>
                </div>
              ) : biometricEmployees.length === 0 ? (
                <p>No biometric employee records found.</p>
              ) : (
                <>
                  <table className="biometric-employee-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Employee Code</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>DOJ</th>
                        <th>Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bioCurrentEmployees.map(emp => (
                        <tr key={emp.EmployeeId}>
                          <td>{emp.EmployeeId}</td>
                          <td>{emp.EmployeeCode}</td>
                          <td>{emp.EmployeeName}</td>
                          <td>{emp.Gender}</td>
                          <td>{emp.DOJ}</td>
                          <td>{emp.Designation || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pagination-controls">
                    <button
                      onClick={() => setBioCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={bioCurrentPage === 1}
                    >
                      Previous
                    </button>

                    <span>Page {bioCurrentPage} of {bioTotalPages}</span>

                    <button
                      onClick={() => setBioCurrentPage(prev => Math.min(prev + 1, bioTotalPages))}
                      disabled={bioCurrentPage === bioTotalPages}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          )}


          {activeTab === 'holidays' && (
            <div className="admin-manage-holidays">
              <h3>Manage Holidays</h3>

              {/* Add Holiday Form */}
              <div className="add-holiday-form">
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Holiday Name"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  required
                />
                <button onClick={handleAddHoliday}>Add Holiday</button>
              </div>

              {/* Show Loader or Table */}
              {loadingHolidays ? (
                <div className="overlay-loader">
                  <div className="spinner"></div>
                  <p>Loading holidays...</p>
                </div>
              ) : (
                <table className="holiday-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Holiday</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.length === 0 ? (
                      <tr><td colSpan="3" style={{ textAlign: 'center' }}>No holidays added yet.</td></tr>
                    ) : (
                      holidays.map(holiday => (
                        <tr key={holiday._id}>
                          <td>{holiday.date}</td>
                          <td>{holiday.name}</td>
                          <td>
                            <button
                              className="delete-holiday-btn"
                              onClick={() => {
                                setHolidayToDelete(holiday);
                                setShowConfirmModal(true);
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {showConfirmModal && holidayToDelete && (
            <div className="confirm-overlay">
              <div className="confirm-modal">
                <h4>Confirm Deletion</h4>
                <p>Are you sure you want to delete <strong>{holidayToDelete.name}</strong>?</p>
                <div className="confirm-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setHolidayToDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-btn"
                    onClick={() => {
                      handleDeleteHoliday(holidayToDelete._id);
                      setShowConfirmModal(false);
                      setHolidayToDelete(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'editEmployee' && (
            <div className="admin-edit-employee">
              <h3>Edit Employee Details</h3>

              {loadingEmployees ? (
                <div className="overlay-loader">
                  <div className="spinner"></div>
                  <p>Loading employee data...</p>
                </div>
              ) : (
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees && employees.length > 0 ? (
                        currentEmployees.map(emp => (
                          <tr key={emp._id}>
                            <td>{emp.name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.department}</td>
                            <td>{emp.position}</td>
                            <td>
                              <button onClick={() => openEditModal(emp)}>Edit</button>
                              <button
                                onClick={() => setEmployeeToDelete(emp)}
                                style={{
                                  marginLeft: '10px',
                                  backgroundColor: 'red',
                                  color: '#fff',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5">No employee data found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="pagination-classic">
                    <button
                      className="page-btn-classic"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>

                    <span className="page-number">{currentPage}</span>

                    <button
                      className="page-btn-classic next"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {editingEmp && (
            <div className="edit-modal-overlay">
              <form className="edit-modal" onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
                <h2>Edit Employee</h2>

                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editingEmp.name}
                    onChange={e => setEditingEmp({ ...editingEmp, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingEmp.email}
                    onChange={e => setEditingEmp({ ...editingEmp, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={editingEmp.department}
                    onChange={e => setEditingEmp({ ...editingEmp, department: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={editingEmp.position}
                    onChange={e => setEditingEmp({ ...editingEmp, position: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Leaves</label>
                  <input
                    type="number"
                    value={editingEmp.leave_balance || ''}
                    onChange={e => {
                      const value = e.target.value;
                      if (!isNaN(value) && Number(value) >= 0) {
                        setEditingEmp({ ...editingEmp, leave_balance: Number(value) });
                      }
                    }}
                    min="0"
                    required
                  />
                </div>


                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setEditingEmp(null)}>Cancel</button>
                  <button type="submit" className="save-btn">Save</button>
                </div>
              </form>
            </div>
          )}

          {employeeToDelete && (
            <div className="edit-modal-overlay">
              <div className="edit-modal">
                <h3>Confirm Deletion</h3>
                <p>Are you sure you want to delete <strong>{employeeToDelete.name}</strong>?</p>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setEmployeeToDelete(null)}>Cancel</button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      handleDeleteEmployee(employeeToDelete._id);
                      setEmployeeToDelete(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'pending' && (
            <div className="admin-pending-checkins">
              <h3>Pending Check-In Approvals</h3>

              <div style={{ marginBottom: '10px' }}>
                <button
                  className="admin-approve-btn"
                  onClick={() => handleBulkDecision('Accepted')}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? 'Accepting...' : 'Accept Selected'}
                </button>
                <button
                  className="admin-reject-btn"
                  onClick={() => handleBulkDecision('Rejected')}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? 'Rejecting...' : 'Reject Selected'}
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="checkbox"
                          checked={
                            selectedCheckins.length === pendingCheckins.length &&
                            pendingCheckins.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                        <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                          Select All
                        </span>
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
                        <button
                          className="admin-approve-btn"
                          onClick={() => handleCheckinDecision(item._id, 'Accepted')}
                          disabled={loadingCheckinId === item._id}
                        >
                          {loadingCheckinId === item._id ? 'Approving...' : 'Accept'}
                        </button>
                        <button
                          className="admin-reject-btn"
                          onClick={() => handleCheckinDecision(item._id, 'Rejected')}
                          disabled={loadingCheckinId === item._id}
                          style={{ marginLeft: '6px' }}
                        >
                          {loadingCheckinId === item._id ? 'Rejecting...' : 'Reject'}
                        </button>
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
                <div className="admin-card pending">
                  Pending: {leaveRequests.filter(l => l.status === 'Pending').length}
                </div>
                <div className="admin-card accepted">
                  Accepted: {leaveRequests.filter(l => l.status === 'Accepted').length}
                </div>
                <div className="admin-card rejected">
                  Rejected: {leaveRequests.filter(l => l.status === 'Rejected').length}
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaveRequests.map((leave, i) => (
                    <tr key={i}>
                      <td>{leave.email}</td>
                      <td>{leave.from_date}</td>
                      <td>{leave.to_date}</td>
                      <td>{leave.reason}</td>
                      <td>{leave.status}</td>
                      <td>
                        {leave.status === 'Pending' ? (
                          <>
                            <button
                              className="admin-approve-btn"
                              onClick={() => handleLeaveDecision(leave._id, 'Accepted')}
                              disabled={loadingLeaveId === leave._id}
                            >
                              {loadingLeaveId === leave._id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              className="admin-reject-btn"
                              onClick={() => handleLeaveDecision(leave._id, 'Rejected')}
                              disabled={loadingLeaveId === leave._id}
                              style={{ marginLeft: '6px' }}
                            >
                              {loadingLeaveId === leave._id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-pagination">
                <button
                  disabled={leavePage === 1}
                  onClick={() => setLeavePage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>{leavePage} / {totalLeavePages}</span>
                <button
                  disabled={leavePage === totalLeavePages}
                  onClick={() => setLeavePage(p => Math.min(totalLeavePages, p + 1))}
                >
                  Next
                </button>
              </div>

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
                <button onClick={handleUploadAttendance} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>

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

                {/* Employee Code */}
                <input
                  type="text"
                  placeholder="Employee Code"
                  value={newEmployee.emp_code}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z0-9 \-]*$/.test(value)) {
                      setNewEmployee({ ...newEmployee, emp_code: value });
                    }
                  }}
                  required
                />

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

                {/* Reporting To (multi-email input) */}
                <label>Reporting To (Press Enter after each email)</label>
                <input
                  type="text"
                  placeholder="Enter email and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const email = e.target.value.trim();
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (emailRegex.test(email) && !newEmployee.reporting_to.includes(email)) {
                        setNewEmployee({ ...newEmployee, reporting_to: [...newEmployee.reporting_to, email] });
                        e.target.value = '';
                      } else {
                        toast.warning("Enter a valid and unique email");
                      }
                    }
                  }}
                />
                <div className="email-tags">
                  {newEmployee.reporting_to.map((email, idx) => (
                    <span key={idx} className="email-tag">
                      {email}
                      <button type="button" onClick={() => {
                        const updated = newEmployee.reporting_to.filter(e => e !== email);
                        setNewEmployee({ ...newEmployee, reporting_to: updated });
                      }}>×</button>
                    </span>
                  ))}
                </div>

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
                    // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$"
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

                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  required
                  className="admin-role-dropdown"
                >
                  <option value="">Select Role</option>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>

                <button type="submit" disabled={addingEmployee}>
                  {addingEmployee ? 'Adding...' : 'Add Employee'}
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