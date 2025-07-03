import React from 'react';
import './Modal.css'; // (Create Modal.css separately for nice modal styling)

const ProfileModal = ({ employee, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Employee Profile</h2>
        <div className="profile-details">
          <p><strong>Name:</strong> {employee.name}</p>
          <p><strong>Email:</strong> {employee.email}</p>
        </div>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ProfileModal;
