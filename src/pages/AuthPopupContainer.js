// components/AuthPopupContainer.js
import React, { useState } from 'react';
import LoginPage from './LoginPage';
import ForgotPasswordPage from './ForgotPasswordPage';

const AuthPopupContainer = ({ onCloseAll }) => {
  const [showLogin, setShowLogin] = useState(true);

  const handleClose = () => {
    setShowLogin(true); // reset for next open
    onCloseAll();
  };

  return (
    <>
      {showLogin ? (
        <LoginPage
          onClose={handleClose}
          openForgotPassword={() => setShowLogin(false)}
        />
      ) : (
        <ForgotPasswordPage openLoginPopup={() => setShowLogin(true)} />
      )}
    </>
  );
};

export default AuthPopupContainer;
