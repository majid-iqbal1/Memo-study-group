/******************************************************************************
*                          LearnMode Component                                *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Interactive flashcard study interface with card flipping           *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* STUDY INTERFACE           |   CARD CONTROLS                                 *
* ------------------------- |   ----------------------------------            *
* - Flashcard display       |   - Flip cards                                  *
* - Progress tracking       |   - Navigate cards                              *
* - Set selection           |   - Keyboard shortcuts                          *
* - Card navigation         |   - Study progress                              *
*                                                                             *
*****************************************************************************/

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase';
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

    // Function to fetch the user's flashcard sets from Firestore
    const fetchFlashcardSets = useCallback(async () => {
        if (!user?.uid) return;
        setLoading(true);
    
        try {
            if (setId) {
                const docRef = doc(db, 'flashcardSets', setId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSelectedSet({ id: docSnap.id, ...docSnap.data() });
                }
            } else {
                const q = query(
                    collection(db, 'flashcardSets'),
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);
                const sets = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFlashcardSets(sets);
            }
        } catch (error) {
            console.error('Error fetching flashcard sets:', error);
        } finally {
            setLoading(false);
        }
    }, [user, setId]);

    // Effect to fetch the flashcard sets when the component mounts
    useEffect(() => {
        fetchFlashcardSets();
    }, [fetchFlashcardSets]);

    // Effect to select a specific flashcard set if the setId is provided in the URL
    useEffect(() => {
        if (setId && flashcardSets.length > 0) {
            const set = flashcardSets.find(s => s.id === setId);
            if (set) {
                handleSetClick(set);
            }
        }
    }, [setId, flashcardSets, handleSetClick]);

    // Function to handle flipping the current flashcard
    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Function to handle navigating to the next flashcard
    const handleNext = useCallback(() => {
        if (selectedSet && currentCardIndex < selectedSet.cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    }, [selectedSet, currentCardIndex]);

    // Function to handle navigating to the previous flashcard
    const handlePrevious = useCallback(() => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    }, [currentCardIndex]);

    // Function to handle going back to the flashcard set selection
    const handleBackToSets = useCallback(() => {
        setSelectedSet(null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        navigate('/library');
    }, [navigate]);

    // Effect to handle keyboard shortcuts for flashcard navigation and flipping
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (selectedSet) {
                switch(e.key) {
                    case ' ':  
                    case 'Enter':
                        e.preventDefault(); 
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

    // Render the error message if there is an error
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

    // Render the flashcard study interface if a set is selected
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

    // Render the flashcard set selection if no set is selected
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