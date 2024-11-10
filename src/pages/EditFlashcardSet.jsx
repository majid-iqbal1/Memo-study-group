import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/edit-flashcard.css';

const EditFlashcardSet = () => {
    const { setId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cards, setCards] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFlashcardSet = async () => {
            try {
                const docRef = doc(db, 'flashcardSets', setId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDescription(data.description);
                    setCards(data.cards);
                } else {
                    setError('Flashcard set not found');
                }
            } catch (error) {
                console.error('Error fetching flashcard set:', error);
                setError('Error loading flashcard set');
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardSet();
    }, [setId]);

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your flashcard set');
            return;
        }

        if (cards.some(card => !card.term.trim() || !card.definition.trim())) {
            alert('Please fill in all terms and definitions');
            return;
        }

        try {
            const docRef = doc(db, 'flashcardSets', setId);
            await updateDoc(docRef, {
                title: title.trim(),
                description: description.trim(),
                cards: cards.map(card => ({
                    term: card.term.trim(),
                    definition: card.definition.trim()
                })),
                updatedAt: new Date()
            });
            navigate('/library');
        } catch (error) {
            console.error('Error updating flashcard set:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this flashcard set? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'flashcardSets', setId));
                navigate('/library');
            } catch (error) {
                console.error('Error deleting flashcard set:', error);
                alert('Failed to delete flashcard set. Please try again.');
            }
        }
    };

    const handleAddCard = () => {
        setCards([...cards, { term: '', definition: '' }]);
    };

    const handleDeleteCard = (index) => {
        if (cards.length > 1) {
            setCards(cards.filter((_, i) => i !== index));
        } else {
            alert('You must have at least one card in the set');
        }
    };

    const handleCardChange = (index, field, value) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setCards(newCards);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <NavLayout>
                <div className="edit-flashcard-page">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate('/library')} className="back-button">
                            Back to Library
                        </button>
                    </div>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="edit-flashcard-page">
                <div className="edit-header">
                    <h1>Edit Flashcard Set</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/library')} className="cancel-button">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="save-button">
                            Save Changes
                        </button>
                        <button onClick={handleDelete} className="delete-button">
                            Delete Set
                        </button>
                    </div>
                </div>

                <div className="edit-form">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter set title"
                        className="title-input"
                    />
                    
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter set description (optional)"
                        className="description-input"
                    />

                    <div className="cards-list">
                        {cards.map((card, index) => (
                            <div key={index} className="card-edit-item">
                                <span className="card-number">{index + 1}</span>
                                <div className="card-inputs">
                                    <input
                                        type="text"
                                        value={card.term}
                                        onChange={(e) => handleCardChange(index, 'term', e.target.value)}
                                        placeholder="Enter term"
                                        className="term-input"
                                    />
                                    <input
                                        type="text"
                                        value={card.definition}
                                        onChange={(e) => handleCardChange(index, 'definition', e.target.value)}
                                        placeholder="Enter definition"
                                        className="definition-input"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleDeleteCard(index)}
                                    className="delete-card-button"
                                    disabled={cards.length === 1}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleAddCard} className="add-card-button">
                        + Add Card
                    </button>
                </div>
            </div>
        </NavLayout>
    );
};

export default EditFlashcardSet;