import React from 'react';
import '../styles/library.css';
import '../styles/basic-page.css';

const Library = () => {
    return (
        <div className="content-section">
            <h1>Your Library</h1>
            <p>Here you can find all your saved materials and study resources.</p>
            <button className="button">Explore Library</button>
        </div>
    );
};

export default Library;