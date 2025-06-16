import React, { useState } from 'react';
import './HomePage.css';
import staffingImage from '../assets/staffing.jpg';
import AuthPopupContainer from './AuthPopupContainer'; // ✅ Updated import
import './LoginPage.css';

const HomePage = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target.className === 'login-overlay') {
      setShowPopup(false);
    }
  };

  return (
    <>
      <div className={`home-container ${showPopup ? 'blurred' : ''}`}>
        {/* Header */}
        <header className="home-header">
          <img src="/Otomeyt_AI_Logo-removebg-preview.png" alt="Otomeyt AI" className="nav-logo" />
          <nav className="nav-links">
            <button onClick={() => setShowPopup(true)}>Login</button>
          </nav>
        </header>

        {/* Main Section */}
        <div className="hero-section">
          <div className="text-section">
            <h1 className="welcome-heading">Welcome to Otomeyt Attendance</h1>
            <p className="welcome-quote">
              At Otomeyt AI, we're transforming recruitment with intelligent,AI-powered platforms.and Assessment 
              <br />
              We make hiring faster and smarter by automating the entire process using our proprietary tool setting a 
              new benchmark in the recruitment and skilling industry.
              <br /><br />
              From hiring top talent to measuring performance and training employees,
              our AI solutions help you build stronger teams and predict success with confidence.
            </p>
          </div>
          <div className="image-section">
            <img src={staffingImage} alt="Staffing" className="staffing-img" />
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Otomeyt AI | <a href="mailto:support@otomeytai.com">support@otomeytai.com</a></p>
            <div className="social-icons">
              <a href="https://facebook.com/OtomeytAI" target="_blank" rel="noreferrer">
                <img src="https://img.icons8.com/ios-filled/24/000000/facebook--v1.png" alt="Facebook" />
              </a>
              <a href="https://twitter.com/OtomeytAI" target="_blank" rel="noreferrer">
                <img src="https://img.icons8.com/ios-filled/24/000000/twitter--v1.png" alt="Twitter" />
              </a>
              <a href="https://linkedin.com/company/otomeyt" target="_blank" rel="noreferrer">
                <img src="https://img.icons8.com/ios-filled/24/000000/linkedin.png" alt="LinkedIn" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* 🔐 Auth Popup with slide-in */}
      {showPopup && (
        <div className="login-overlay" onClick={handleOverlayClick}>
          <AuthPopupContainer onCloseAll={() => setShowPopup(false)} />
        </div>
      )}
    </>
  );
};

export default HomePage;
