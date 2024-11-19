import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from '../UserContext';
import { useNavigate } from "react-router-dom";
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/create-test.css';

const CreateTest = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState('');
    const [loading, setLoading] = useState(true); // State for loading
    const { user } = useUser(); // Retrieve user from context
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
                setLoading(false); // Stop loading when fetching completes
            }
        };

        fetchFlashcardSets();
    }, [user]);

    const handleFlashcardSetChange = (e) => {
        const setId = e.target.value;
        setSelectedSet(setId);

        if (setId === '') {
            setQuestions([]); // Allow manual question addition when no set is selected
            return;
        }

        const selectedSet = flashcardSets.find(set => set.id === setId);
        if (selectedSet) {
            const newQuestions = selectedSet.cards.map(card => ({
                question: card.term || '', // Assuming "term" represents the question in flashcard
                correctAnswer: card.definition || '', // Assuming "definition" represents the answer
                wrongAnswers: ['', '', ''] // Placeholder for wrong answers
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
            <div className="create-test">
                <h1>Create a Test</h1>
                <div>
                    <label>
                        Test Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Select Flashcard Set:
                        <select value={selectedSet} onChange={handleFlashcardSetChange}>
                            <option value="">None</option>
                            {flashcardSets.map((set) => (
                                <option key={set.id} value={set.id}>{set.title}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="question-list">
                    {questions.map((q, index) => (
                        <div key={index} className="question-block">
                            <label>
                                Question {index + 1}:
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                />
                            </label>
                            <label>
                                Correct Answer:
                                <input
                                    type="text"
                                    value={q.correctAnswer}
                                    onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                                />
                            </label>
                            {q.wrongAnswers.map((wrongAnswer, i) => (
                                <label key={i}>
                                    Wrong Answer {i + 1}:
                                    <input
                                        type="text"
                                        value={wrongAnswer}
                                        onChange={(e) => handleWrongAnswerChange(index, i, e.target.value)}
                                    />
                                </label>
                            ))}
                            <button onClick={() => handleRemoveQuestion(index)} className="remove-question-button">
                                Remove Question
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddQuestion} className="add-question-button">
                        Add Question
                    </button>
                </div>
                <button onClick={handleSubmit}>Create Test</button>
            </div>
        </NavLayout>
    );
};

export default CreateTest;
