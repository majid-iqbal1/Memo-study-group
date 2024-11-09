import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from './components/auth';
import Homepage from './pages/Homepage';
import About from './pages/about';
import Contact from './pages/contact';
import Library from './pages/library';
import Create from './pages/create';
import JoinGroups from './pages/joingroups';
import { auth } from './firebase';

// Layout component to handle transitions
const PageLayout = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
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

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/homepage" />
              ) : (
                <PageLayout>
                  <Auth />
                </PageLayout>
              )
            }
          />
          <Route
            path="/homepage"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <Homepage />
                </PageLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/about"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <About />
                </PageLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/contact"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <Contact />
                </PageLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/library"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <Library />
                </PageLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <Create />
                </PageLayout>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/join"
            element={
              isAuthenticated ? (
                <PageLayout>
                  <JoinGroups />
                </PageLayout>
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