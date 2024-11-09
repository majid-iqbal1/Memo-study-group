import React from 'react';
import '../styles/learnmode.css';
import NavLayout from '../components/NavLayout';

const LearnMode = () => {
    return (
        <NavLayout>
        <div className="learn-mode-page">
            <h1>Learn Mode</h1>
            <p>Adaptive learning that adjusts to your progress.</p>
            <button className="start-learning-button">Start Learning</button>
        </div>
        </NavLayout>
    );
};

export default LearnMode;