// PopupNotification.jsx
import React, { useEffect } from 'react';
import './PopupNotification.css';

const PopupNotification = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the popup after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [onClose]);

  return (
    <div className="popup-notification">
      <p>{message}</p>
    </div>
  );
};

export default PopupNotification;
