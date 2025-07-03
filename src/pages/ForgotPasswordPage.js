import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ForgotPasswordPage.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FaSpinner } from "react-icons/fa";



const ForgotPasswordPage = ({ openLoginPopup }) => {
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    const { new_password, confirm_password } = formData;
    if (new_password !== confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true); // Start loading

    try {
      await axios.post('https://backend-api-corrected-1.onrender.com/auth/forgot-password', {
        email: formData.email,
        new_password: formData.new_password,
      });

      toast.success('Password reset successful! Please login.');
      if (openLoginPopup) openLoginPopup();
    } catch (err) {
      toast.error('Reset Failed');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // const handleReset = async (e) => {
  //   e.preventDefault();
  //   const { new_password, confirm_password } = formData;
  //   if (new_password !== confirm_password) {
  //     toast.error('Passwords do not match');
  //     return;
  //   }

  //   try {
  //     await axios.post('https://backend-api-corrected-1.onrender.com/auth/forgot-password', {
  //       email: formData.email,
  //       new_password: formData.new_password,
  //     });
  //     toast.success('Password reset successful! Please login.');
  //     if (openLoginPopup) openLoginPopup();
  //   } catch (err) {
  //     toast.error('Reset Failed');
  //   }
  // };

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
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="new_password"
            placeholder="New Password"
            required
            value={formData.new_password}
            onChange={handleChange}
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="eye-icon"
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </div>

        {/* Confirm Password */}
        <div className="password-field">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="Confirm Password"
            required
            value={formData.confirm_password}
            onChange={handleChange}
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="eye-icon"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : 'Reset Password'}
        </button>

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
      {loading && (
        <div className="overlay-loader">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

    </div>
  );
};

export default ForgotPasswordPage;
