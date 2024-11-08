import React from 'react';
import '../styles/library.css';
import BackHomeNav from '../components/BackHomeNav';

const Library = () => {
    return (
        <div className="library-page">
            <BackHomeNav />
            <h1>Your Library</h1>
            <p>Find all your saved materials and study resources here.</p>
            <button className="explore-button">Explore Library</button>
        </div>
    );
};

export default Library;
