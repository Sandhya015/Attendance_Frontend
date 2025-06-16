import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = ({ openLoginPopup }) => {
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleReset = async (e) => {
    e.preventDefault();
    const { new_password, confirm_password } = formData;
    if (new_password !== confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/forgot-password', {
        email: formData.email,
        new_password: formData.new_password,
      });
      toast.success('Password reset successful! Please login.');
      if (openLoginPopup) openLoginPopup();
    } catch (err) {
      toast.error('Reset Failed');
    }
  };

  return (
    <div className="login-slide">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <button onClick={openLoginPopup} className="close-btn">×</button>
      <img src="/Otomeyt_AI_Logo.jpg" alt="Otomeyt AI" className="logo" />
      <h2>Reset Password</h2>
      <form onSubmit={handleReset} autoComplete="off">
        <input
          type="email"
          name="email"
          placeholder="Registered Email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="new_password"
          placeholder="New Password"
          required
          value={formData.new_password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          required
          value={formData.confirm_password}
          onChange={handleChange}
        />
        <button type="submit">Reset Password</button>
        <div className="extra-links">
        <span
  onClick={openLoginPopup}
  style={{
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#0e1a86',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '15px',
    fontSize: '16px',
  }}
>
  Back to Login
</span>

        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
