// src/services/api.js
import axios from 'axios';

// 1. Create an axios instance with baseURL
const API = axios.create({
  baseURL: 'http://localhost:5000',
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

export const getProfile = () =>
  axios.get('http://localhost:5000/employee/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

export const updateEmployeeProfile = (updatedData) =>
  axios.put('http://localhost:5000/employee/update-profile', updatedData, {
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
export const getAllLeaveRequests = () => API.get('/admin/leave-requests');
export const updateLeaveStatus = (id, status) => API.put(`/admin/leave-requests/${id}`, { status });
export const addEmployee = (employeeData) => API.post('/admin/add-employee', employeeData);
export const addManualAttendance = (data) => API.post('/admin/manual-attendance', data);

export default API;