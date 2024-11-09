import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const useAutoLogout = (timeoutMinutes = 30) => {
    const navigate = useNavigate();
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showWarning, setShowWarning] = useState(false);

    const updateLastActivity = (event) => {
        // Check if event exists and has target before using closest
        if (event && event.target && typeof event.target.closest === 'function') {
            const isWarningModal = event.target.closest('.timeout-warning');
            if (!showWarning || !isWarningModal) {
                setLastActivity(Date.now());
                setShowWarning(false);
            }
        } else {
            // If no event or target, just update the activity
            setLastActivity(Date.now());
            setShowWarning(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleStayLoggedIn = () => {
        setLastActivity(Date.now());
        setShowWarning(false);
    };

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click'
        ];

        // Add event listeners
        const handleEvent = (e) => updateLastActivity(e);
        events.forEach(event => {
            window.addEventListener(event, handleEvent);
        });

        // Check for inactivity
        const intervalId = setInterval(() => {
            const timeoutMilliseconds = timeoutMinutes * 60 * 1000;
            const timeSinceLastActivity = Date.now() - lastActivity;
            const warningMilliseconds = (timeoutMinutes * 60 - 60) * 1000; // Warning 60 seconds before timeout

            if (timeSinceLastActivity > timeoutMilliseconds) {
                handleLogout();
            } else if (timeSinceLastActivity > warningMilliseconds && !showWarning) {
                setShowWarning(true);
            }
        }, 1000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleEvent);
            });
            clearInterval(intervalId);
        };
    }, [lastActivity, timeoutMinutes, showWarning, navigate]);

    return {
        updateLastActivity,
        handleStayLoggedIn,
        showWarning,
        handleLogout
    };
};

export default useAutoLogout;