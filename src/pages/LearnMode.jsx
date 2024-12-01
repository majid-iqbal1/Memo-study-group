import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/learnmode.css';

const LearnMode = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSet, setSelectedSet] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setId = searchParams.get('setId');

    const handleSetClick = useCallback((set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    }, []);

    const fetchFlashcardSets = useCallback(async () => {
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
            
            sets.sort((a, b) => b.createdAt - a.createdAt);
            setFlashcardSets(sets);
            
            if (setId) {
                const selectedSet = sets.find(s => s.id === setId);
                if (selectedSet) {
                    handleSetClick(selectedSet);
                }
            }
        } catch (error) {
            console.error('Error fetching flashcard sets:', error);
            setError('Failed to load flashcard sets');
        } finally {
            setLoading(false);
        }
    }, [user, setId, handleSetClick]);

    useEffect(() => {
        fetchFlashcardSets();
    }, [fetchFlashcardSets]);

    useEffect(() => {
        if (setId && flashcardSets.length > 0) {
            const set = flashcardSets.find(s => s.id === setId);
            if (set) {
                handleSetClick(set);
            }
        }
    }, [setId, flashcardSets, handleSetClick]);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const handleNext = useCallback(() => {
        if (selectedSet && currentCardIndex < selectedSet.cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    }, [selectedSet, currentCardIndex]);

    const handlePrevious = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    }, [currentCardIndex]);

    const handleBackToSets = useCallback(() => {
        setSelectedSet(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        navigate('/library');
    }, [navigate]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (selectedSet) {
                switch(e.key) {
                    case ' ':  // Spacebar
                    case 'Enter':
                        e.preventDefault(); // Prevent page scroll on spacebar
                        handleFlip();
                        break;
                    case 'ArrowRight':
                    case 'n':
                        handleNext();
                        break;
                    case 'ArrowLeft':
                    case 'p':
                        handlePrevious();
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedSet, handleFlip, handleNext, handlePrevious]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <NavLayout>
                <div className="learn-mode-page">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchFlashcardSets} className="retry-button">
                            Try Again
                        </button>
                    </div>
                </div>
            </NavLayout>
        );
    }

    if (selectedSet) {
        return (
            <NavLayout>
                <div className="flashcard-study">
                    <div className="study-header">
                        <button onClick={handleBackToSets} className="back-button">
                            ← Back to Sets
                        </button>
                        <h2>{selectedSet.title}</h2>
                        <p className="progress">
                            Card {currentCardIndex + 1} of {selectedSet.cards.length}
                        </p>
                    </div>

                    <div className="flashcard-container">
                        <div 
                            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                            onClick={handleFlip}
                        >
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <p>{selectedSet.cards[currentCardIndex].term}</p>
                                </div>
                                <div className="flashcard-back">
                                    <p>{selectedSet.cards[currentCardIndex].definition}</p>
                                </div>
                            </div>
                        </div>

                        <div className="navigation-controls">
                            <button 
                                onClick={handlePrevious}
                                disabled={currentCardIndex === 0}
                                className="nav-button"
                            >
                                ← Previous
                            </button>
                            <button 
                                onClick={handleNext}
                                disabled={currentCardIndex === selectedSet.cards.length - 1}
                                className="nav-button"
                            >
                                Next →
                            </button>
                        </div>

                        <div className="study-tips">
                            <p>Tip: Use spacebar to flip, and arrow keys for navigation</p>
                        </div>
                    </div>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="learn-mode-page">
                <h1>Study Your Flashcards</h1>
                {flashcardSets.length === 0 ? (
                    <div className="empty-sets">
                        <p>You haven't created any flashcard sets yet.</p>
                        <button onClick={() => navigate('/create')} className="create-button">
                            Create Your First Set
                        </button>
                    </div>
                ) : (
                    <div className="flashcard-sets">
                        {flashcardSets.map(set => (
                            <div 
                                key={set.id} 
                                className="set-card"
                                onClick={() => handleSetClick(set)}
                            >
                                <h3>{set.title}</h3>
                                <p>{set.description}</p>
                                <div className="set-info">
                                    <span>{set.cards.length} cards</span>
                                    <span className="click-hint">Click to study</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </NavLayout>
    );
};

export default LearnMode;