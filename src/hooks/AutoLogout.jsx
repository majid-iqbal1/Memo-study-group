/******************************************************************************
*                         useAutoLogout Hook                                  *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Auto logout users after period of inactivity                       *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
******************************************************************************/

/******************************** Features ************************************
*                                                                             *
* ACTIVITY TRACKING         |   LOGOUT BEHAVIOR                               *
* ------------------------- |   ----------------------------------            *
* - Mouse movements         |   - Auto logout after timeout                   *
* - Keyboard input          |   - Redirect to login                           *
* - Touch events            |   - Clear user session                          *
*                                                                             *
******************************************************************************/

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase';

// Custom hook that automatically logs out the user after a period of inactivity
const useAutoLogout = (timeoutMinutes = 30) => {
    const navigate = useNavigate();

    // Effect that sets up the auto-logout functionality
    useEffect(() => {
        let lastActivity = Date.now();

        const handleLogout = async () => {
            try {
                await signOut(auth);
                navigate('/');
            } catch (error) {
                console.error('Logout error:', error);
            }
        };

        // List of events that will be used to track user activity
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        const updateActivity = () => {
            lastActivity = Date.now();
        };

        events.forEach(event => {
            window.addEventListener(event, updateActivity);
        });
        
        const intervalId = setInterval(() => {
            const timeoutMilliseconds = timeoutMinutes * 60 * 1000;
            if (Date.now() - lastActivity > timeoutMilliseconds) {
                handleLogout();
            }
        }, 1000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateActivity);
            });
            clearInterval(intervalId);
        };
    }, [timeoutMinutes, navigate]);

    return { WarningComponent: null };
};

export default useAutoLogout;