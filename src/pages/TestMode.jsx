import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/test-mode.css';

const TestMode = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [testTitle, setTestTitle] = useState('');
    const [showScore, setShowScore] = useState(false);
    const [searchParams] = useSearchParams();
    const testId = searchParams.get('testId');
    const navigate = useNavigate();

    const fetchTest = useCallback(async () => {
        try {
            const docRef = doc(collection(db, 'tests'), testId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setTestTitle(data.title);
                setQuestions(data.questions);
            } else {
                alert('Test not found.');
                navigate('/tests');
            }
        } catch (error) {
            console.error('Error fetching test:', error);
            alert('Failed to load the test.');
        } finally {
            setLoading(false);
        }
    }, [testId, navigate]);

    useEffect(() => {
        if (testId) {
            fetchTest();
        } else {
            navigate('/tests');
        }
    }, [fetchTest, testId, navigate]);

    const handleAnswerSelect = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore((prevScore) => prevScore + 1);
        }
        setSelectedAnswer('');
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            setShowScore(true);
        }
    };

    const handleTryAgain = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setShowScore(false);
        setSelectedAnswer('');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (questions.length === 0) {
        return (
            <NavLayout>
                <div className="test-mode-page">
                    <p>No questions available for this test.</p>
                </div>
            </NavLayout>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <NavLayout>
            <div className="test-mode-page">
                <h1>{testTitle}</h1>
                {showScore ? (
                    <div className="score-block">
                        <h2>Test completed!</h2>
                        <p>Your score: {score}/{questions.length}</p>
                        <button onClick={() => navigate('/tests')}>Back to Tests</button>
                        <button onClick={handleTryAgain}>Try Again</button>
                    </div>
                ) : (
                    <div className="question-block">
                        <h2>Question {currentQuestionIndex + 1}:</h2>
                        <p>{currentQuestion.question}</p>
                        <div className="answers">
                            {[currentQuestion.correctAnswer, ...currentQuestion.wrongAnswers].sort().map((answer, index) => (
                                <button
                                    key={index}
                                    className={`answer-button ${selectedAnswer === answer ? 'selected' : ''}`}
                                    onClick={() => handleAnswerSelect(answer)}
                                >
                                    {answer}
                                </button>
                            ))}
                        </div>
                        <button
                            className="next-button"
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswer}
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                        </button>
                    </div>
                )}
            </div>
        </NavLayout>
    );
};

export default TestMode;