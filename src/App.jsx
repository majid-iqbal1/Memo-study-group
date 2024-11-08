import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from './components/auth';
import Homepage from './Homepage';
import About  from './pages/about';
import Contact from './pages/contact';
import Library from './pages/library';
import Create from './pages/create';
import JoinGroups from './pages/joingroups';
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
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Auth />} />
          <Route path="/homepage" element={isAuthenticated ? <Homepage /> : <Navigate to="/" />} />
          <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;