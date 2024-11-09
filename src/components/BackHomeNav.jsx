import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/backhome-nav.css';

const BackHomeNav = () => {
    const navigate = useNavigate();

    return (
        <div className="nav-buttons">
            <button onClick={() => navigate(-1)} className="nav-button">Back</button>
            <button onClick={() => navigate('/homepage')} className="nav-button">Home</button>
        </div>
    );
};

export default BackHomeNav;