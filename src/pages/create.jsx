import React from 'react';
import '../styles/create.css';
import BackHomeNav from '../components/BackHomeNav';

const Create = () => {
    return (
        <div className="create-page">
            <BackHomeNav />
            <h1>Create New Content</h1>
            <p>Start adding new flashcards, notes, or quizzes to your collection.</p>
            <button className="create-button">Start Creating</button>
        </div>
    );
};

export default Create;