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

    const WarningComponent = showWarning ? (
        <div className="timeout-warning">
            <div className="timeout-warning-content">
                <h3>Session Timeout Warning</h3>
                <p>Your session will expire in 1 minute due to inactivity.</p>
                <div className="timeout-buttons">
                    <button onClick={handleStayLoggedIn}>Stay Logged In</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
        </div>
    ) : null;

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
        handleLogout,
        WarningComponent
    };
};

/* const styles = `
.timeout-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.timeout-warning-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    max-width: 400px;
}

.timeout-warning h3 {
    margin-bottom: 1rem;
    color: #333;
}

.timeout-warning p {
    margin-bottom: 1.5rem;
    color: #666;
}

.timeout-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.timeout-buttons button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.timeout-buttons button:first-child {
    background: #3c91e6;
    color: white;
}

.timeout-buttons button:last-child {
    background: #f1f1f1;
    color: #333;
}
`; */

export default useAutoLogout;