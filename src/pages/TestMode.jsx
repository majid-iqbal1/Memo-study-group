/******************************************************************************
*                          TestMode Component                                 *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Interactive test interface with multiple choice questions          *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
******************************************************************************/

/******************************** Features ************************************
*                                                                             *
* TEST INTERFACE            |   QUESTION HANDLING                             *
* ------------------------- |   ----------------------------------            *
* - Multiple choice display |   - Answer selection                            *
* - Score tracking          |   - Answer shuffling                            *
* - Navigation controls     |   - Progress tracking                           *
* - Test completion         |   - Score calculation                           *
*                                                                             *
*****************************************************************************/

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase";
import NavLayout from "../components/NavLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/test-mode.css";

const TestMode = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState("");
  const [showScore, setShowScore] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [searchParams] = useSearchParams();
  const testId = searchParams.get("testId");
  const navigate = useNavigate();

  const fetchTest = useCallback(async () => {
    try {
      const docRef = doc(collection(db, "tests"), testId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTestTitle(data.title);
        setQuestions(data.questions);
        setAnsweredCorrectly(new Array(data.questions.length).fill(false));
        setShuffledAnswers(shuffleAnswers(data.questions[0]));
      } else {
        alert("Test not found.");
        navigate("/tests");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      alert("Failed to load the test.");
    } finally {
      setLoading(false);
    }
  }, [testId, navigate]);

  const shuffleAnswers = (question) => {
    const answers = [
      question.correctAnswer,
      ...question.wrongAnswers.filter((answer) => answer.trim() !== ""),
    ].sort();
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }

  useEffect(() => {
    if (testId) {
      fetchTest();
    } else {
      navigate("/tests");
    }
  }, [fetchTest, testId, navigate]);

  useEffect(() => {
    if (questions.length > 0) {
      setShuffledAnswers(shuffleAnswers(questions[currentQuestionIndex]));
    }
  }, [questions, currentQuestionIndex]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect && !answeredCorrectly[currentQuestionIndex]) {
      setScore((prevScore) => prevScore + 1);
      setAnsweredCorrectly((prevState) => {
        const newState = [...prevState];
        newState[currentQuestionIndex] = true;
        return newState;
      });
    }

    setSelectedAnswer("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setShowScore(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setSelectedAnswer("");
    }
  };

  const handleTryAgain = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowScore(false);
    setSelectedAnswer("");
    setAnsweredCorrectly(new Array(questions.length).fill(false));
    if (questions.length > 0) {
      setShuffledAnswers(shuffleAnswers(questions[0]));
    }
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
            <p>
              Your score: {score}/{questions.length}
            </p>
            <button onClick={() => navigate("/tests")}>Back to Tests</button>
            <button onClick={handleTryAgain}>Try Again</button>
          </div>
        ) : (
          <div className="question-block">
            <h2>Question {currentQuestionIndex + 1}:</h2>
            <p>{currentQuestion.question}</p>
            <div className="answers">
              {shuffledAnswers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-button ${selectedAnswer === answer ? "selected" : ""
                    }`}
                  onClick={() => handleAnswerSelect(answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
            <div className="navigation-buttons">
              {currentQuestionIndex > 0 && (
                <button
                  className="previous-button"
                  onClick={handlePreviousQuestion}
                >
                  Previous
                </button>
              )}
              <button
                className="next-button"
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Next"
                  : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  );
};

export default TestMode;
