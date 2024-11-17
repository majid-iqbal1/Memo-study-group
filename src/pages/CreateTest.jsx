import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import '../styles/create-test.css';

const CreateTest = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ id: 1, question: '', correctAnswer: '', wrongAnswers: ['', '', ''] }]);
    const [useFlashcards, setUseFlashcards] = useState(false);
    const { user } = useUser();
    const navigate = useNavigate();

    const addQuestion = () => {
        const newId = questions.length + 1;
        setQuestions([...questions, { id: newId, question: '', correctAnswer: '', wrongAnswers: ['', '', ''] }]);
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleWrongAnswerChange = (id, index, value) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, wrongAnswers: q.wrongAnswers.map((a, i) => i === index ? value : a) } : q));
    };

    const handleSaveTest = async () => {
        if (!title.trim()) {
            alert('Please enter a title for the test.');
            return;
        }

        if (questions.some(q => !q.question.trim() || !q.correctAnswer.trim() || q.wrongAnswers.some(a => !a.trim()))) {
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

    return (
        <div className="create-test">
            <h1>Create a Test</h1>
            <div>
                <label>
                    Test Title:
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                </label>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={useFlashcards} onChange={e => setUseFlashcards(e.target.checked)} />
                </label>
            </div>
            {questions.map((q, index) => (
                <div key={q.id} className="question-block">
                    <label>
                        Question {index + 1}:
                        <input type="text" value={q.question} onChange={e => handleQuestionChange(q.id, 'question', e.target.value)} />
                    </label>
                    <label>
                        Correct Answer:
                        <input type="text" value={q.correctAnswer} onChange={e => handleQuestionChange(q.id, 'correctAnswer', e.target.value)} />
                    </label>
                    {q.wrongAnswers.map((answer, i) => (
                        <label key={i}>
                            Wrong Answer {i + 1}:
                            <input type="text" value={answer} onChange={e => handleWrongAnswerChange(q.id, i, e.target.value)} />
                        </label>
                    ))}
                </div>
            ))}
            <button onClick={addQuestion}>Add Question</button>
            <button onClick={handleSaveTest}>Save Test</button>
        </div>
    );
};

export default CreateTest;