/******************************************************************************
*                        PopupNotification Component                          *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Display temporary notification messages to users                   *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* DISPLAY                   |   BEHAVIOR                                      *
* ------------------------- |   -------------------------------------------   *
* - Message text            |   - Auto dismiss after 3s                       *
* - Popup styling           |   - Cleanup on unmount                          *
* - Fade animations         |   - Customizable message                        *
*                                                                             *
******************************************************************************/

import React, { useEffect } from 'react';
import '../styles/PopupNotification.css';

const PopupNotification = ({ message, onClose }) => {
  useEffect(() => {
    // Automatically close the popup after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-notification">
      <p>{message}</p>
    </div>
  );
};

export default PopupNotification;
