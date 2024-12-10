import React from 'react';
import '../styles/loadingspinner.css';

// React component that renders a loading spinner indicator
const LoadingSpinner = () => {
    return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
        </div>
    );
};

export default LoadingSpinner;