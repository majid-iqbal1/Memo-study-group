import React, { useEffect, useState } from 'react';
import './timeoutwarning.css';

const TimeoutWarning = ({ onStayLoggedIn, onLogout, warningTime = 60 }) => {
    const [timeLeft, setTimeLeft] = useState(warningTime);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onLogout, warningTime]);

    return (
        <div className="timeout-warning">
            <div className="timeout-warning-content">
                <h2>Session Timeout Warning</h2>
                <p>Your session will expire in {timeLeft} seconds due to inactivity.</p>
                <div className="timeout-warning-buttons">
                    <button onClick={onStayLoggedIn} className="stay-button">
                        Stay Logged In
                    </button>
                    <button onClick={onLogout} className="logout-button">
                        Logout Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeoutWarning;
