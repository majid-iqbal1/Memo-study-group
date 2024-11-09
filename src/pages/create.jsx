import React from 'react';
import '../styles/create.css';
import NavLayout from '../components/NavLayout';

const Create = () => {
    return (
        <NavLayout>
        <div className="create-page">
            <h1>Create New Content</h1>
            <p>Start adding new flashcards, notes, or quizzes to your collection.</p>
            <button className="create-button">Start Creating</button>
        </div>
        </NavLayout>
    );
};

export default Create;