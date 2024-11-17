import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../UserContext';
import NavLayout from '../components/NavLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/test.css';

const Test = () => {
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
        navigate(`/test/${test.id}`);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <NavLayout>
            <div className="test-page">
                <h1>Test Your Knowledge</h1>
                {tests.length === 0 ? (
                    <div className="empty-tests">
                        <p>No tests available. Create your first one now!</p>
                        <button onClick={handleCreateTest} className="create-button">
                            Create Your First Test
                        </button>
                    </div>
                ) : (
                    <div className="tests-list">
                        {tests.map((test) => (
                            <div key={test.id} className="test-card">
                                <h3>{test.title}</h3>
                                <p>{test.questions.length} questions</p>
                                <div className="test-actions">
                                    <button
                                        onClick={() => handleTest(test)}
                                        className="view-button"
                                    >
                                        View Test
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </NavLayout>
    );
};

export default Test;
