/******************************************************************************
*                          Tests Component                                    *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Display and manage user's collection of created tests              *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* TEST MANAGEMENT           |   USER ACTIONS                                  *
* ------------------------- |   ----------------------------------            *
* - Test list display       |   - Take test                                   *
* - Test descriptions       |   - Edit test                                   *
* - Question count          |   - Create new test                             *
*                                                                             *
*****************************************************************************/

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import { useUser } from '../UserContext';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/tests.css';

const Tests = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchTests = useCallback(async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const q = query(
                collection(db, 'tests'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const userTests = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTests(userTests);
        } catch (error) {
            console.error('Error fetching tests:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const handleCreateTest = async () => {
        navigate('/create-test');
    };

    const handleTest = (test) => {
        navigate(`/test?testId=${test.id}`);
    };

    const handleEditTest = (e, test) => {
        e.stopPropagation();
        navigate(`/edit-test/${test.id}`);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <NavLayout>
            <div className="tests-page">
                <h1>Test Your Knowledge</h1>
                {tests.length === 0 ? (
                    <div className="empty-tests">
                        <p>No tests available. Create your first one now!</p>
                        <button onClick={handleCreateTest} className="create-button">
                            Create Your First Test
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="tests-list">
                            {tests.map(test => (
                                <div key={test.id} className="test-card">
                                    <h3>{test.title}</h3>
                                    <p>{test.description}</p>
                                    <div className="test-info">
                                        <span>{test.questions.length} questions</span>
                                        <div className="test-actions">
                                            <button onClick={() => handleTest(test)} className="view-button">
                                                Take Test
                                            </button>
                                            <button onClick={(e) => handleEditTest(e, test)} className="edit-button">
                                                Edit Test
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="create-test-container">
                            <button onClick={handleCreateTest} className="create-button">
                                Create New Test
                            </button>
                        </div>
                    </>
                )}
            </div>
        </NavLayout>
    );
};

export default Tests;
