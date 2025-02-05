/******************************************************************************
*                         CreateTest Component                                *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Form interface for creating tests from flashcards or manually      *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
******************************************************************************/

/******************************** Features ************************************
*                                                                             *
* TEST CREATION             |   QUESTION HANDLING                             *
* ------------------------- |   ----------------------------------            *
* - Basic test info         |   - Add/remove questions                        *
* - Import from flashcards  |   - Multiple choice answers                     *
* - Test description        |   - Question validation                         *
* - Progress tracking       |   - Form submission                             *
*                                                                             *
*****************************************************************************/

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from '../UserContext';
import { useNavigate } from "react-router-dom";
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/create-test.css';

const CreateTest = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [description, setDescription] = useState('');
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            if (!user?.uid) {
                setLoading(false);
                return;
            }
            try {
                const q = query(collection(db, 'flashcardSets'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const sets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFlashcardSets(sets);
            } catch (error) {
                console.error('Error fetching flashcard sets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardSets();
    }, [user]);

    const handleFlashcardSetChange = (e) => {
        const setId = e.target.value;
        setSelectedSet(setId);

        if (setId === '') {
            setQuestions([]);
            return;
        }

        const selectedSet = flashcardSets.find(set => set.id === setId);
        if (selectedSet) {
            const newQuestions = selectedSet.cards.map(card => ({
                question: card.term || '',
                correctAnswer: card.definition || '',
                wrongAnswers: ['', '', '']
            }));
            setQuestions(newQuestions);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { question: '', correctAnswer: '', wrongAnswers: ['', '', ''] }
        ]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

    const handleWrongAnswerChange = (qIndex, aIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].wrongAnswers[aIndex] = value;
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a title for the test.');
            return;
        }

        if (questions.some(q => !q.question.trim() || !q.correctAnswer.trim())) {
            alert('Please fill out all fields for each question.');
            return;
        }

        const test = {
            title: title.trim(),
            description: description.trim(),
            questions,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            userId: user.uid
        };

        try {
            await addDoc(collection(db, 'tests'), test);
            alert('Test created successfully!');
            navigate('/test');
        } catch (error) {
            console.error('Error creating test:', error);
            alert('Failed to save the test. Please try again.');
        }
    };

    if (loading) {
        return (
            <NavLayout>
                <LoadingSpinner />
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="test-creator">
                <h1>Create a New test</h1>
                <p className="subtitle">
                Fill in the details below to create a test
                </p>

                <div className="test-section">
                    <h4>Test Information</h4>
                    <input
                        type="text"
                        placeholder="Enter a test title"
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
                </div>

                <div className="import-section">
                    <h4>Import from Flashcards</h4>
                    <div className="select-set">
                        <select value={selectedSet} onChange={handleFlashcardSetChange}>
                            <option value="">None</option>
                            {flashcardSets.map((set) => (
                                <option key={set.id} value={set.id}>{set.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="questions-section">
                    <h4>Test Questions</h4>
                    {questions.map((q, index) => (
                        <div key={index} className="question-item">
                            <div className="question-number">Question {index + 1}</div>
                            <label>
                                <input
                                    type="text"
                                    placeholder="Enter question"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                />
                            </label>
                            <label>
                                <input
                                    type="text"
                                    placeholder="Correct Answer"
                                    value={q.correctAnswer}
                                    onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                                />
                            </label>
                            {q.wrongAnswers.map((wrongAnswer, i) => (
                                <label key={i}>
                                    <input
                                        type="text"
                                        placeholder={`Wrong Answer ${i + 1}`}
                                        value={wrongAnswer}
                                        onChange={(e) => handleWrongAnswerChange(index, i, e.target.value)}
                                    />
                                </label>
                            ))}
                            <button onClick={() => handleRemoveQuestion(index)} className="remove-question-btn">
                                Remove Question
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddQuestion} className="add-question-btn">
                        Add Question
                    </button>
                </div>

                <div className="action-buttons">
                    <button onClick={handleSubmit} className="create-test-btn">
                        Create Test
                    </button>
                </div>
            </div>
        </NavLayout>
    );
};

export default CreateTest;
