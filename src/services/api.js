// src/services/api.js
import axios from 'axios';

// 1. Create an axios instance with baseURL
const API = axios.create({
  baseURL: 'https://backend-api-corrected-1.onrender.com',
});

// 2. Automatically attach JWT token from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Attendance-related endpoints
export const checkin = (data) => API.post('/attendance/checkin', data);
export const checkout = (data) => API.post('/attendance/checkout', data);
export const getHistory = () => API.get('/attendance/history');
export const submitLeaveRequest = (data) => API.post('/leave/request', data);
export const getLeaveHistory = () => API.get('/leave/my-requests');
export const getEmployeeSummary = () => API.get('/employee/summary');
// api.js
export const getHolidays = () => API.get('/employee/holidays');


export const getProfile = () =>
  axios.get('https://backend-api-corrected-1.onrender.com/employee/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

export const updateEmployeeProfile = (updatedData) =>
  axios.put('https://backend-api-corrected-1.onrender.com/employee/update-profile', updatedData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

// 4. Admin endpoints
export const checkAdminExists = () => API.get('/admin/check');
export const getAllRecords = (filters) => API.get('/admin/records', { params: filters });
export const exportCSV = () => API.get('/admin/export', { responseType: 'blob' });
export const getPendingCheckins = () => API.get('/admin/checkins/pending');
export const approveCheckin = (id, status) => API.post(`/admin/checkins/approve/${id}`, { status });
export const rejectCheckin = (id) => API.post(`/admin/checkins/reject/${id}`);
export const getAllLeaveRequests = () => API.get('/admin/leave-requests');
export const updateLeaveStatus = (id, status) => API.put(`/admin/leave-requests/${id}`, { status });
export const addEmployee = (employeeData) => API.post('/admin/add-employee', employeeData);
export const addManualAttendance = (data) => API.post('/admin/manual-attendance', data);
// export const getBiometricLogs = () => API.get('/admin/biometric-logs');
export const getBiometricLogs = (filters) =>
  API.get('/admin/biometric-logs', filters ? { params: filters } : {});
// Biometric Employees
// export const getBiometricEmployees = () => API.get('/admin/employees/biometric');
// Accept employeeId optionally
export const getBiometricEmployees = (employeeId) =>
  API.get('/admin/employees/biometric', {
    params: employeeId ? { EmployeeId: employeeId } : {},
  });







// HOLIDAYS
export const addHoliday = (holidayData) => API.post('/admin/holidays', holidayData);
export const deleteHoliday = (id) => API.delete(`/admin/holidays/${id}`);
export const getAllHolidays = () => API.get('/admin/holidays');

//Manager
export const getTeamMembers = () => API.get('/manager/team');
export const getTeamSummary = () => API.get('/manager/team-summary');
export const getManagerPendingCheckins = () => API.get('manager/checkins/pending');
export const approveCheckinByManager = (id) => API.post(`manager/checkins/approve/${id}`);
export const rejectCheckinByManager = (id) => API.post(`/checkins/reject/${id}`);






export default API;