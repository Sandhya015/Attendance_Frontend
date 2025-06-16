import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { checkAdminExists } from '../services/api'; // ✅ make sure this is imported
import './SignupPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',

  });

  const [adminExists, setAdminExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminExists().then((res) => {
      setAdminExists(res.data.exists);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState('');


  const validateForm = () => {
    const nameRegex = /^[A-Za-z ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!nameRegex.test(formData.name)) {
      setError("Name should contain only letters and spaces.");
      return false;
    }
  
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
  
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
  
    setError(""); // clear errors
    return true;
  };
  
  
  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      await axios.post('http://localhost:5000/signup', formData);
      toast.success('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error('Signup failed!');
    }
  };
  

  return (
    <div className="signup-container">
        <ToastContainer
                          position="top-right"
                          autoClose={3000}
                          hideProgressBar={false}
                          newestOnTop={false}
                          closeOnClick
                          rtl={false}
                          pauseOnFocusLoss
                          draggable
                          pauseOnHover
                          theme="colored"
        />
      <div className="signup-box">
        <img src="/Otomeyt_AI_Logo.jpg" alt="Otomeyt AI" className="logo" />
        <h2>Sign Up</h2>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={handleSignup} autoComplete='off'>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleChange}
          />
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
             <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="employee">Employee</option>
            {!adminExists && <option value="admin">Admin</option>}
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <div className="extra-links">
          <a href="/login">Already have an account? Login</a>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
