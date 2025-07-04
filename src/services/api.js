// // src/services/api.js
// import axios from 'axios';

// // 1. Create an axios instance with baseURL
// const API = axios.create({
//   baseURL: 'https://backend-api-corrected-1.onrender.com',
// });

// // 2. Automatically attach JWT token from localStorage
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // 3. Attendance-related endpoints
// export const checkin = (data) => API.post('/attendance/checkin', data);
// export const checkout = (data) => API.post('/attendance/checkout', data);
// export const getHistory = () => API.get('/attendance/history');
// export const submitLeaveRequest = (data) => API.post('/leave/request', data);
// export const getLeaveHistory = () => API.get('/leave/my-requests');
// export const getEmployeeSummary = () => API.get('/employee/summary');
// // api.js
// export const getHolidays = () => API.get('/employee/holidays');


// export const getProfile = () =>
//   axios.get('https://backend-api-corrected-1.onrender.com/employee/profile', {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`
//     }
//   });

// export const updateEmployeeProfile = (updatedData) =>
//   axios.put('https://backend-api-corrected-1.onrender.com/employee/update-profile', updatedData, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`,
//     },
//   });

// // 4. Admin endpoints
// export const checkAdminExists = () => API.get('/admin/check');
// export const getAllRecords = (filters) => API.get('/admin/records', { params: filters });
// export const exportCSV = () => API.get('/admin/export', { responseType: 'blob' });
// export const getPendingCheckins = () => API.get('/admin/checkins/pending');
// export const approveCheckin = (id, status) => API.post(`/admin/checkins/approve/${id}`, { status });
// export const rejectCheckin = (id) => API.post(`/admin/checkins/reject/${id}`);
// export const getAllLeaveRequests = () => API.get('/admin/leave-requests');
// export const updateLeaveStatus = (id, status) => API.put(`/admin/leave-requests/${id}`, { status });
// export const addEmployee = (employeeData) => API.post('/admin/add-employee', employeeData);
// export const addManualAttendance = (data) => API.post('/admin/manual-attendance', data);
// // export const getBiometricLogs = () => API.get('/admin/biometric-logs');
// export const getBiometricLogs = (filters) =>
//   API.get('/admin/biometric-logs', filters ? { params: filters } : {});
// // Biometric Employees
// // export const getBiometricEmployees = () => API.get('/admin/employees/biometric');
// // Accept employeeId optionally
// export const getBiometricEmployees = (employeeId) =>
//   API.get('/admin/employees/biometric', {
//     params: employeeId ? { EmployeeId: employeeId } : {},
//   });







// // HOLIDAYS
// export const addHoliday = (holidayData) => API.post('/admin/holidays', holidayData);
// export const deleteHoliday = (id) => API.delete(`/admin/holidays/${id}`);
// export const getAllHolidays = () => API.get('/admin/holidays');

// //Manager
// export const getTeamMembers = () => API.get('/manager/team');
// export const getTeamSummary = () => API.get('/manager/team-summary');
// export const getManagerPendingCheckins = () => API.get('manager/checkins/pending');
// export const approveCheckinByManager = (id) => API.post(`manager/checkins/approve/${id}`);
// export const rejectCheckinByManager = (id) => API.post(`/checkins/reject/${id}`);
// export const getPendingLeaveApprovals = () =>
//   API.get('/leave/pending-approvals');







// export default API;


// src/services/api.js
import axios from 'axios';

// 1. Create axios instance
const API = axios.create({
  baseURL: 'https://backend-api-corrected-1.onrender.com',
});

// 2. Request interceptor to attach access_token
API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 3. Response interceptor to refresh token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If Unauthorized and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Call refresh endpoint
        const res = await axios.post(
          'https://backend-api-corrected-1.onrender.com/auth/refresh',
          { refresh_token: refreshToken }
        );

        const { access_token } = res.data;

        // Store new access_token
        localStorage.setItem('access_token', access_token);

        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Retry the original request
        return API(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear all stored data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');

        // Redirect to login
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// 4. Login endpoint: store tokens + user info
export const login = async (credentials) => {
  try {
    const res = await axios.post(
      'https://backend-api-corrected-1.onrender.com/auth/login',
      credentials
    );

    const { access_token, refresh_token, name, role } = res.data;

    if (!access_token || !refresh_token) {
      throw new Error('Login failed: Tokens missing.');
    }

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_role', role);

    return res; // success
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err);
    throw err; // let the caller know
  }
};




/* ============ Attendance ============ */
export const checkin = (data) => API.post('/attendance/checkin', data);
export const checkout = (data) => API.post('/attendance/checkout', data);
export const getHistory = () => API.get('/attendance/history');
export const submitLeaveRequest = (data) => API.post('/leave/request', data);
export const getLeaveHistory = () => API.get('/leave/my-requests');
export const getEmployeeSummary = () => API.get('/employee/summary');
export const getHolidays = () => API.get('/employee/holidays');

/* ============ Employee Profile ============ */
export const getProfile = () => API.get('/employee/profile');
export const updateEmployeeProfile = (updatedData) =>
  API.put('/employee/update-profile', updatedData);

/* ============ Admin ============ */
export const checkAdminExists = () => API.get('/admin/check');
export const getAllRecords = (filters) =>
  API.get('/admin/records', { params: filters });
export const exportCSV = () => API.get('/admin/export', { responseType: 'blob' });
export const getPendingCheckins = () => API.get('/admin/checkins/pending');
export const approveCheckin = (id, status) =>
  API.post(`/admin/checkins/approve/${id}`, { status });
export const rejectCheckin = (id) => API.post(`/admin/checkins/reject/${id}`);
export const getAllLeaveRequests = () => API.get('/admin/leave-requests');
export const updateLeaveStatus = (id, status) =>
  API.put(`/admin/leave-requests/${id}`, { status });
export const addEmployee = (employeeData) => API.post('/admin/add-employee', employeeData);
export const addManualAttendance = (data) => API.post('/admin/manual-attendance', data);
export const getBiometricLogs = (filters) =>
  API.get('/admin/biometric-logs', filters ? { params: filters } : {});
export const getBiometricEmployees = (employeeId) =>
  API.get('/admin/employees/biometric', {
    params: employeeId ? { EmployeeId: employeeId } : {},
  });
export const getWeeklyLowBiometricHours = (params) =>
  API.get("/admin/biometric/weekly-underworked", { params });



/* ============ Holidays ============ */
export const addHoliday = (holidayData) => API.post('/admin/holidays', holidayData);
export const deleteHoliday = (id) => API.delete(`/admin/holidays/${id}`);
export const getAllHolidays = () => API.get('/admin/holidays');

/* ============ Manager ============ */
export const getTeamMembers = () => API.get('/manager/team');
export const getTeamSummary = () => API.get('/manager/team-summary');
export const getManagerPendingCheckins = () => API.get('/manager/checkins/pending');
export const approveCheckinByManager = (id) =>
  API.post(`/manager/checkins/approve/${id}`);
export const rejectCheckinByManager = (id) =>
  API.post(`/checkins/reject/${id}`);
export const getPendingLeaveApprovals = () => API.get('/leave/pending-approvals');

export const withdrawLeaveRequest = (leaveId) =>
  API.post(`/leave/withdraw/${leaveId}`);

export default API;