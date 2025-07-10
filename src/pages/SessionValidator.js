// src/components/SessionValidator.js
import React, { useEffect, useState } from 'react';

const SessionValidator = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const lastUnload = localStorage.getItem('unload_time');
    const now = Date.now();

    if (lastUnload && now - parseInt(lastUnload) > 1000) {
      // Considered a tab/browser close
      localStorage.removeItem('session_active');
    }

    localStorage.removeItem('unload_time');
    setReady(true); // Allow app to load
  }, []);

  if (!ready) return null; // or a loader
  return children;
};

export default SessionValidator;
