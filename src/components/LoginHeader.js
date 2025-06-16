import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginHeader.css';

const LoginHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="login-header">
      <img src="/Otomeyt_AI_Logo-removebg-preview.png" alt="Otomeyt AI" className="nav-logo" />
      {/* <nav className="nav-links">
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Signup</button>
      </nav> */}
      <h1>Attendance & Access Management</h1>
    </header>
  );
};

export default LoginHeader;
