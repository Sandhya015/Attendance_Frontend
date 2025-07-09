// 

// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ManagerDashboard from './pages/ManagerDashboard';

/** Protect Dashboard Routes */
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('access_token');
  const storedRole = localStorage.getItem('role');
  if (!token || storedRole !== role) {
    return <Navigate to="/home" />;
  }
  return children;
};


/** Auto-redirect logged-in users from root/login/home to dashboard */
const RedirectIfAuthenticated = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');

  if (token) {
    return <Navigate to={`/${role}`} />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated>
              <HomePage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/home"
          element={
            <RedirectIfAuthenticated>
              <HomePage />
            </RedirectIfAuthenticated>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
