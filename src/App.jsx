import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from './components/auth';
import Homepage from './pages/Homepage';
import About from './pages/about';
import Contact from './pages/contact';
import Library from './pages/library';
import Create from './pages/create';
import JoinGroups from './pages/joingroups';
import LearnMode from './pages/LearnMode';
import EditFlashcardSet from './pages/EditFlashcardSet';
import Test from './pages/Test';
import { auth } from './firebase';
import useAutoLogout from './hooks/useAutoLogout';
import LoadingSpinner from './components/LoadingSpinner';

const AuthenticatedRoute = ({ children }) => {
    const { WarningComponent } = useAutoLogout(10); 
    
    return (
        <>
            {children}
            {WarningComponent}
        </>
    );
};

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
                        path="/test" 
                        element={
                            isAuthenticated ? (
                                <AuthenticatedRoute>
                                    <Test />
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