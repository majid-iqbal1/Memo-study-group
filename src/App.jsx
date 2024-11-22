// Router for application
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// React hooks imports
import { useEffect, useState } from 'react';

// Firebase imports
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Component imports and pages
import { Auth } from './components/auth';
import Homepage from './pages/Homepage';
import About from './pages/about';
import Contact from './pages/contact';
import Library from './pages/library';
import Create from './pages/create';
import CreateGroup from './pages/create-group';
import JoinGroups from './pages/joingroups';
import LearnMode from './pages/LearnMode';
import EditFlashcardSet from './pages/EditFlashcardSet';
import Tests from './pages/Tests';
import CreateTest from './pages/CreateTest';
import TestMode from './pages/TestMode';
import EditTest from './pages/EditTest';

// custom hook and utility function imports
import useAutoLogout from './hooks/useAutoLogout';
import LoadingSpinner from './components/LoadingSpinner';

// implement auto logout after 10 minutes of inactivity
// wraps all authenticated routes
const AuthenticatedRoute = ({ children }) => {
    const { WarningComponent } = useAutoLogout(10);

    return (
        <>
            {children}
            {WarningComponent}
        </>
    );
};

// manage authentication state
// use firebase onAuthStateChanged to check if user is authenticated
// if authenticated, render the homepage and show loading spinner while checking
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/homepage" /> : <Auth />}
                    />
                    <Route
                        path="/homepage"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Homepage />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <About />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/contact"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Contact />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/library"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Library />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Create />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/join"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <JoinGroups />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/create-group"  // Note: Use kebab-case for URLs
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <CreateGroup />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/learn"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <LearnMode />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/edit/:setId"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <EditFlashcardSet />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/tests"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Tests />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/create-test"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <CreateTest />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/test"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <TestMode />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/edit-test/:testId"
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <EditTest />
                                </AuthenticatedRoute>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
