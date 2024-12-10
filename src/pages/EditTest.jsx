/******************************************************************************
*                          EditTest Component                                 *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Interface for editing and managing existing tests                  *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* TEST EDITING              |   QUESTION MANAGEMENT                           *
* ------------------------- |   ----------------------------------            *
* - Update title/desc       |   - Add/remove questions                        *
* - Save changes            |   - Edit answers                                *
* - Delete test             |   - Multiple choice options                     *
* - Cancel edits            |   - Validation checks                           *
*                                                                             *
*****************************************************************************/

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../Firebase';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/edit-test.css';

const EditTest = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const docRef = doc(db, 'tests', testId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    setDescription(data.description || '');
                    setQuestions(data.questions);
                } else {
                    setError('Test not found');
                }
            } catch (error) {
                console.error('Error fetching test:', error);
                setError('Error loading test');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your test.');
            return;
        }

        if (questions.some(q => !q.question.trim() || !q.correctAnswer.trim())) {
            alert('Please fill in all questions and correct answers.');
            return;
        }

        try {
            const docRef = doc(db, 'tests', testId);
            await updateDoc(docRef, {
                title: title.trim(),
                description: description.trim(),
                questions,
                updatedAt: new Date()
            });
            alert('Test updated successfully!');
            navigate('/tests');
        } catch (error) {
            console.error('Error updating test:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
            try {
                await deleteDoc(doc(db, 'tests', testId));
                alert('Test deleted successfully!');
                navigate('/tests');
            } catch (error) {
                console.error('Error deleting test:', error);
                alert('Failed to delete test. Please try again.');
            }
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { question: '', correctAnswer: '', wrongAnswers: ['', '', ''] }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
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

    if (loading) {
        return (
            <NavLayout>
                <LoadingSpinner />
            </NavLayout>
        );
    }

    if (error) {
        return (
            <NavLayout>
                <div className="edit-test-page">
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => navigate('/tests')} className="back-button">
                            Back to Tests
                        </button>
                    </div>
                </div>
            </NavLayout>
        );
    }

    return (
        <NavLayout>
            <div className="edit-test-page">
                <h2>Edit Test</h2>

                <div className="test-section">
                    <h3>Test Information</h3>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter test title"
                        className="title-input"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter test description (optional)"
                        className="description-input"
                    />
                </div>

                <div className="questions-section">
                    <h3>Test Questions</h3>
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
                    <button onClick={() => navigate('/tests')} className="cancel-button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="save-button">
                        Save Changes
                    </button>
                    <button onClick={handleDelete} className="delete-button">
                        Delete Test
                    </button>
                </div>
            </div>
        </NavLayout>
    );
};

export default EditTest;
