// import React, { useState } from 'react';
// import './Modal.css';
// import { updateEmployeeProfile } from '../services/api'; // Make sure this sends the password too
// import { toast } from 'react-toastify';

// const SettingsModal = ({ employee, setEmployee, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: employee.name,
//     department: employee.department,
//     position: employee.position,
//     password: ""
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         name: formData.name,
//         department: formData.department,
//         position: formData.position,
//       };

//       if (formData.password.trim()) {
//         payload.password = formData.password;
//       }

//       await updateEmployeeProfile(payload); // Call backend API
//       setEmployee({ ...employee, ...payload });

//       toast.success("Profile updated successfully!");
//       onClose();
//     } catch (error) {
//       console.error("Update failed:", error);
//       toast.error("Failed to update profile.");
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h2>Edit Settings</h2>
//         <div className="settings-form">
//           <label>Name:</label>
//           <input type="text" name="name" value={formData.name} onChange={handleChange} />

//           <label>Change Password:</label>
//           <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter new password" />

//           <div className="modal-buttons">
//             <button onClick={handleSave}>Save</button>
//             <button className="modal-close" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsModal;



// ======================================================NEW FEATURES===============================================

import React, { useState } from 'react';
import './Modal.css';
import { updateEmployeeProfile } from '../services/api';
import { toast } from 'react-toastify';

const SettingsModal = ({ employee, setEmployee, onClose }) => {
  const [formData, setFormData] = useState({
    name: employee.name,
    department: employee.department || '',
    position: employee.position || '',
    join_date: employee.join_date || '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'department' || name === 'position') && /[^a-zA-Z\s]/.test(value)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    const payload = {
      name: formData.name.trim(),
      department: formData.department.trim(),
      position: formData.position.trim(),
      join_date: formData.join_date,
    };

    if (formData.password.trim()) {
      if (formData.password.length < 8) {
        toast.warning("Password must be at least 8 characters.");
        return;
      }
      payload.password = formData.password;
    }

    try {
      await updateEmployeeProfile(payload);
      setEmployee({ ...employee, ...payload });
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Settings</h2>
        <div className="settings-form">
          <label>Full Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />

          <label>Change Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 8 characters" />

          <label>Department:</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" />

          <label>Position:</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="e.g. Developer" />

          <label>Date of Joining:</label>
          <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} />

          <div className="modal-buttons">
            <button onClick={handleSave}>Save</button>
            <button className="modal-close" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
