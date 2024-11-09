import React from 'react';
import '../styles/library.css';
import NavLayout from '../components/NavLayout';

const Library = () => {
    return (
        <NavLayout>
            <div className="library-page">
                <h1>Your Library</h1>
                <p>Find all your saved materials and study resources here.</p>
                <button className="explore-button">Explore Library</button>
            </div>
        </NavLayout>
    );
};

export default Library;
