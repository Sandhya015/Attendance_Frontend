import React, { useEffect, useState } from 'react';

const ClockGreeting = () => {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const name = localStorage.getItem('name') || 'User'; // Default fallback

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now);

      const hour = now.getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock-greeting">
      <h2>{greeting}, {name}👋</h2>
      <p>{time.toLocaleTimeString()}</p>
    </div>
  );
};

export default ClockGreeting;

