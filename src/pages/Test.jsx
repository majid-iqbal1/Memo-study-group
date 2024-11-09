import React from 'react';
import '../styles/test.css';
import BackHomeNav from '../components/BackHomeNav';

const Test = () => {
    return (
        <div className="test-page">
            <BackHomeNav />
            <h1>Test Your Knowledge</h1>
            <p>Practice in a stress-free environment before the real exam.</p>
            <button className="start-test-button">Begin Test</button>
        </div>
    );
};

export default Test;