import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import TimeoutWarning from '../components/timeout/TimeoutWarning';

const useAutoLogout = (timeoutMinutes = 30) => {
    const navigate = useNavigate();
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [showWarning, setShowWarning] = useState(false);
    const warningTimeSeconds = 60;

    const updateLastActivity = (event) => {
        const isWarningModal = event?.target?.closest('.timeout-warning');
        if (!showWarning || !isWarningModal) {
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

        events.forEach(event => {
            window.addEventListener(event, updateLastActivity);
        });

        const intervalId = setInterval(() => {
            const timeoutMilliseconds = timeoutMinutes * 60 * 1000;
            const timeSinceLastActivity = Date.now() - lastActivity;
            const warningMilliseconds = (timeoutMinutes * 60 - warningTimeSeconds) * 1000;

            if (timeSinceLastActivity > timeoutMilliseconds) {
                handleLogout();
            } else if (timeSinceLastActivity > warningMilliseconds && !showWarning) {
                setShowWarning(true);
            }
        }, 1000);

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateLastActivity);
            });
            clearInterval(intervalId);
        };
    }, [lastActivity, timeoutMinutes, showWarning]);

    return {
        updateLastActivity,
        WarningComponent: showWarning ? (
            <TimeoutWarning
                onStayLoggedIn={handleStayLoggedIn}
                onLogout={handleLogout}
                warningTime={warningTimeSeconds}
            />
        ) : null
    };
};

export default useAutoLogout;