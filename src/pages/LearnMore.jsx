import React from 'react';
import '../styles/learnmore.css';
import BackHomeNav from '../components/BackHomeNav';

const LearnMore = () => {
    return (
        <div className="learn-more-page">
            <BackHomeNav />
            <h1>Learn More</h1>
            <p>Adaptive learning that adjusts to your progress.</p>
            <button className="start-learning-button">Start Learning</button>
        </div>
    );
};

export default LearnMore;