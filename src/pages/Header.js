import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleProtectedClick = () => {
    alert('Please login to access the dashboard');
    navigate('/login');
  };

  return (
    <header className="home">
      <img
        src="/Otomeyt_AI_Logo-removebg-preview.png"
        alt="Otomeyt AI"
        className="nav-logo"
      />
      <nav className="nav-links">
        <button onClick={() => navigate('/home')}>Home</button>
        <button onClick={handleProtectedClick}>Employee Dashboard</button>
        <button onClick={handleProtectedClick}>Admin Dashboard</button>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Signup</button>
      </nav>
    </header>
  );
};

export default Header;
