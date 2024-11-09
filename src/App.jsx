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
import LearnMore from './pages/LearnMore';
import Test from './pages/Test';
import { auth } from './firebase';

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

  if (loading) return <p>Loading...</p>;

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
            element={isAuthenticated ? <Homepage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/about" 
            element={isAuthenticated ? <About /> : <Navigate to="/" />} 
          />
          <Route 
            path="/contact" 
            element={isAuthenticated ? <Contact /> : <Navigate to="/" />} 
          />
          <Route 
            path="/library" 
            element={isAuthenticated ? <Library /> : <Navigate to="/" />} 
          />
          <Route 
            path="/create" 
            element={isAuthenticated ? <Create /> : <Navigate to="/" />} 
          />
          <Route 
            path="/join" 
            element={isAuthenticated ? <JoinGroups /> : <Navigate to="/" />} 
          />
          <Route 
            path="/learn" 
            element={isAuthenticated ? <LearnMore /> : <Navigate to="/" />} 
          />
          <Route 
            path="/test" 
            element={isAuthenticated ? <Test /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;