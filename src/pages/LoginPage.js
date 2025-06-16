// components/LoginPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onClose, openForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    setError('');
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await axios.post('http://localhost:5000/login', formData);
      const { token, role, name } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      onClose();
      navigate(role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed!');
    }
  };

  return (
    <div className="login-slide">
      <button onClick={onClose} className="close-btn" aria-label="Close login">×</button>
      <div className="login-box">
        <img src="/Otomeyt_AI_Logo.jpg" alt="Otomeyt AI" className="logo smaller" />
        <h2>Login</h2>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleLogin} autoComplete="off">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit">Login</button>
          <div className="extra-links">
            <p>
            <span
  onClick={openForgotPassword}
  style={{
    cursor: 'pointer',
    color: '#0e1a86',
    textDecoration: 'underline',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '15px'
  }}
>
  Forgot Password?
</span>
            </p>
            {/* <p><a href="/signup">Don't have an account? Signup</a></p> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
