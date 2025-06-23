import React, { useEffect, useState } from 'react';

const ManagerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem('token'); // Or however you're storing the JWT

  const fetchRequests = async () => {
    const res = await fetch('https:backend-api-corrected-1.onrender.com/leave/pending-approvals', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      setRequests(data);
    } else {
      alert(data.msg || "Could not load approvals.");
    }
  };

  const handleDecision = async (id, action) => {
    const res = await fetch(`https:backend-api-corrected-1.onrender.com/leave/approve/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.msg);
      fetchRequests(); // refresh list
    } else {
      alert(data.msg || 'Error');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h2>Pending Leave Approvals</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Employee</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req._id}>
              <td>{req.email}</td>
              <td>{req.from_date}</td>
              <td>{req.to_date}</td>
              <td>{req.reason}</td>
              <td>
                <button onClick={() => handleDecision(req._id, "approve")}>✅ Approve</button>
                <button onClick={() => handleDecision(req._id, "reject")}>❌ Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerDashboard;
