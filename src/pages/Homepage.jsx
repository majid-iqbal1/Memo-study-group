import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase.jsx';
import '../styles/homepage.css';
import ProfileSidebar from '../components/profilesildebar.jsx';
import { useUser } from '../UserContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Homepage = () => {
    const { user, loading } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [filteredSets, setFilteredSets] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchMode, setSearchMode] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            if (!user?.uid) return;
            setIsLoading(true);

            try {
                let q;
                if (searchMode === 'my') {
                    // Fetch only user's sets
                    q = query(
                        collection(db, 'flashcardSets'),
                        where('userId', '==', user.uid)
                    );
                } else {
                    // Fetch all sets
                    q = query(collection(db, 'flashcardSets'));
                }

                const querySnapshot = await getDocs(q);
                const sets = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));

                // Sort by creation date (newest first)
                sets.sort((a, b) => b.createdAt - a.createdAt);
                setFlashcardSets(sets);
            } catch (error) {
                console.error('Error fetching flashcard sets:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFlashcardSets();
    }, [user, searchMode]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = flashcardSets.filter(set =>
                set.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredSets(filtered);
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    }, [searchTerm, flashcardSets]);

    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const openSidebar = () => {
        setIsSidebarOpen(true);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="nav-container">
            <header>
                <nav>
                    <div className="logo">
                        <img src="/logo.png" alt="Memo+ Logo" className="home-logo-image" />
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/homepage" className={isActive('/homepage')}>Home</Link></li>
                        <li><Link to="/library" className={isActive('/library')}>Your Library</Link></li>
                        <li><Link to="/create" className={isActive('/create')}>Create</Link></li>
                        <li><Link to="/join" className={isActive('/join')}>Join Groups</Link></li>
                        <li><Link to="/about" className={isActive('/about')}>About Us</Link></li>
                        <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
                    </ul>
                </nav>
                <div className="profile-container">
                    <span className="profile-name">{user ? user.name : 'User'}</span>
                    <button className="profile-icon" onClick={openSidebar}>
                        {user?.profilePictureURL ? (
                            <img src={user.profilePictureURL} alt="Profile" className="profile-icon-image" />
                        ) : (
                            <div className="initials-placeholder">{getInitials(user?.name)}</div>
                        )}
                    </button>
                </div>
            </header>
            <main className="homepage-content">
                <h1>Memo+</h1>
                <p>Learn Faster Using Only the Essentials</p>

                <div className="search-container">
                    <div className="search-header">
                        <div className="search-mode-toggle">
                            <button
                                className={`mode-btn ${searchMode === 'all' ? 'active' : ''}`}
                                onClick={() => setSearchMode('all')}
                            >
                                All Sets
                            </button>
                            <button
                                className={`mode-btn ${searchMode === 'my' ? 'active' : ''}`}
                                onClick={() => setSearchMode('my')}
                            >
                                My Sets
                            </button>
                        </div>
                    </div>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder={`Search ${searchMode === 'my' ? 'your' : 'all'} flashcard sets...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {isSearching && (
                        <div className="search-results">
                            <h2>Search Results</h2>
                            {isLoading ? (
                                <div className="loading-results">
                                    <LoadingSpinner />
                                </div>
                            ) : filteredSets.length > 0 ? (
                                <div className="results-list">
                                    {filteredSets.map(set => (
                                        <div
                                            key={set.id}
                                            className="result-item"
                                            onClick={() => navigate(`/learn?setId=${set.id}`)}
                                        >
                                            <div className="result-info">
                                                <span className="result-title">{set.title}</span>
                                                <span className="result-creator">
                                                    by {set.userId === user.uid ? 'You' : (set.createdBy || 'Anonymous')}
                                                </span>
                                            </div>
                                            <span className="card-count">{set.cards?.length || 0} cards</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-results">
                                    <p>No flashcard sets found matching "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <section className="guide">
                <h2>Guide</h2>
                <div className="guide-items">
                    <Link to="/create" className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/flashcards.png`} alt="Flashcard Logo" className="logo-image" />
                        <h3>Flashcards</h3>
                        <p>Create your own digital flashcards that flip with a click</p>
                    </Link>
                    <Link to="/learn" className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/learn-more.png`} alt="Learn More Logo" className="logo-image" />
                        <h3>Learn Mode</h3>
                        <p>An adaptive learning feature. Tracks what terms you know well and which terms need a little more work.</p>
                    </Link>
                    <Link to="/tests" className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/test.png`} alt="Test Logo" className="logo-image" />
                        <h3>Tests</h3>
                        <p>Test yourself in a stress-free environment before the real thing.</p>
                    </Link>
                </div>
            </section>

            <footer>
                <p>&copy; 2024 Memo+</p>
            </footer>

            {isSidebarOpen && <ProfileSidebar onClose={closeSidebar} />}
        </div>
    );
};

export default Homepage;