import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-box">
        <img src="/Otomeyt_AI_Logo.jpg" alt="Otomeyt AI" className="logo" />
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for does not exist or has been moved.</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
};

export default NotFound;
