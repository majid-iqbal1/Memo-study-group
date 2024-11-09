import React from 'react';
import '../styles/test.css';
import NavLayout from '../components/NavLayout';

const Test = () => {
    return (
        <NavLayout>
        <div className="test-page">
            <h1>Test Your Knowledge</h1>
            <p>Practice in a stress-free environment before the real exam.</p>
            <button className="start-test-button">Begin Test</button>
        </div>
        </NavLayout>
    );
};

export default Test;