import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';
import NavLayout from '../components/NavLayout';
import '../styles/library.css';

const Library = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            if (!user?.uid) {
                setLoading(false);
                setError('Please log in to view your flashcard sets');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const q = query(
                    collection(db, 'flashcardSets'),
                    where('userId', '==', user.uid)
                );
                
                const querySnapshot = await getDocs(q);
                const sets = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
                
                // Sort sets by creation date (newest first)
                sets.sort((a, b) => b.createdAt - a.createdAt);
                
                setFlashcardSets(sets);
            } catch (error) {
                console.error('Error fetching flashcard sets:', error);
                setError('Failed to load flashcard sets. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardSets();
    }, [user]);

    const handleSetClick = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (currentCardIndex < selectedSet.cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleBack = () => {
        setSelectedSet(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    if (error) {
        return (
            <NavLayout>
                <div className="library-page">
                    <div className="error-message">
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="retry-button"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </NavLayout>
        );
    }

    if (loading) {
        return (
            <NavLayout>
                <div className="library-page">
                    <h1>Your Library</h1>
                    <div className="loading">Loading your flashcards...</div>
                </div>
            </NavLayout>
        );
    }

    if (selectedSet) {
        return (
            <NavLayout>
                <div className="flashcard-viewer">
                    <div className="viewer-header">
                        <button onClick={handleBack} className="back-button">
                            ← Back to Library
                        </button>
                        <h2>{selectedSet.title}</h2>
                        <p className="card-count">
                            Card {currentCardIndex + 1} of {selectedSet.cards.length}
                        </p>
                    </div>

                    <div 
                        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                        onClick={handleFlip}
                    >
                        <div className="flashcard-inner">
                            <div className="flashcard-front">
                                {selectedSet.cards[currentCardIndex].term}
                            </div>
                            <div className="flashcard-back">
                                {selectedSet.cards[currentCardIndex].definition}
                            </div>
                        </div>
                    </div>

                    <div className="navigation-buttons">
                        <button 
                            onClick={handlePrevious}
                            disabled={currentCardIndex === 0}
                            className="nav-button"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={handleNext}
                            disabled={currentCardIndex === selectedSet.cards.length - 1}
                            className="nav-button"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="library-page">
                <h1>Your Library</h1>
                {flashcardSets.length === 0 ? (
                    <div className="empty-library">
                        <p>You haven't created any flashcard sets yet.</p>
                        <button 
                            onClick={() => window.location.href='/create'} 
                            className="create-button"
                        >
                            Create Your First Set
                        </button>
                    </div>
                ) : (
                    <div className="flashcard-sets">
                        {flashcardSets.map(set => (
                            <div 
                                key={set.id} 
                                className="flashcard-set-card"
                                onClick={() => handleSetClick(set)}
                            >
                                <h3>{set.title}</h3>
                                <p>{set.description}</p>
                                <div className="set-info">
                                    <span>{set.cards.length} cards</span>
                                    <span>{set.createdAt.toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </NavLayout>
    );
};

export default Library;