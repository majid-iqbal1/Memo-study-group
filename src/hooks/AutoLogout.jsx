import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../Firebase';

const useAutoLogout = (timeoutMinutes = 30) => {
    const navigate = useNavigate();

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