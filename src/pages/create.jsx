import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';
import '../styles/create.css';
import NavLayout from '../components/NavLayout';

const Create = () => {
    const [flashcards, setFlashcards] = useState([{ id: 1, term: '', definition: '' }]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();

    const addCard = () => {
        const newId = flashcards.length + 1;
        setFlashcards([...flashcards, { id: newId, term: '', definition: '' }]);
    };

    const handleTermChange = (id, value) => {
        setFlashcards(flashcards.map(card => 
            card.id === id ? { ...card, term: value } : card
        ));
    };

    const handleDefinitionChange = (id, value) => {
        setFlashcards(flashcards.map(card => 
            card.id === id ? { ...card, definition: value } : card
        ));
    };

    const handleCreateSet = async (redirectToPractice = false) => {
        if (!title.trim()) {
            alert('Please enter a title for your flashcard set');
            return;
        }

        if (flashcards.some(card => !card.term.trim() || !card.definition.trim())) {
            alert('Please fill in all terms and definitions');
            return;
        }

        setIsSubmitting(true);

        try {
            const flashcardSet = {
                title: title.trim(),
                description: description.trim(),
                cards: flashcards.map(({ term, definition }) => ({ term, definition })),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                userId: user.uid,
                createdBy: user.name || 'Anonymous'
            };

            const docRef = await addDoc(collection(db, 'flashcardSets'), flashcardSet);
            
            if (redirectToPractice) {
                navigate(`/learn?setId=${docRef.id}`);
            } else {
                navigate('/library');
            }
        } catch (error) {
            console.error('Error creating flashcard set:', error);
            alert('Failed to create flashcard set. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateAndPractice = () => {
        handleCreateSet(true);
    };

    return (
        <NavLayout>
            <div className="flashcard-creator">
                <h2>Create a new flashcard set</h2>
                
                <div className="creator-form">
                    <input
                        type="text"
                        placeholder='Enter a title, like "Biology - Chapter 22: Evolution"'
                        className="title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    
                    <textarea
                        placeholder="Add a description..."
                        className="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    {/* <div className="tool-buttons">
                        <button className="tool-btn">
                            <span>+</span> Import
                        </button>
                        <button className="tool-btn">
                            <span>+</span> Add diagram
                        </button>
                        <button className="tool-btn">
                            <span>→</span> Create from notes
                        </button>
                    </div> */}

                    {flashcards.map((card) => (
                        <div key={card.id} className="flashcard-item">
                            <span className="card-number">{card.id}</span>
                            <div className="card-content">
                                <input 
                                    type="text" 
                                    placeholder="Enter term" 
                                    className="term-input"
                                    value={card.term}
                                    onChange={(e) => handleTermChange(card.id, e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Enter definition" 
                                    className="definition-input"
                                    value={card.definition}
                                    onChange={(e) => handleDefinitionChange(card.id, e.target.value)}
                                />
                            </div>
                            <button className="image-btn">📷 Image</button>
                        </div>
                    ))}

                    <button className="add-card-btn" onClick={addCard}>
                        ADD A CARD
                    </button>

                    <div className="action-buttons">
                       {/* <button 
                            onClick={() => navigate('/homepage')} 
                            className="cancel-button"
                        >
                            Cancel 
                        </button> */}
                        
                        <button 
                            onClick={handleCreateSet}
                            className="create-btn"
                        >
                            Create
                        </button>
                        <button 
                            onClick={handleCreateAndPractice}
                            className="create-practice-btn"
                        >
                            Create and practice
                        </button>
                    </div>
                </div>
            </div>
        </NavLayout>
    );
};

export default Create;