import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase.jsx';
import { doc, getDoc } from 'firebase/firestore';
import './Homepage.css';
import ProfileSidebar from './components/profilesildebar.jsx';
import { useUser } from './UserContext.jsx';

const Homepage = () => {
    const { user } = useUser(); // Access the user from the UserContext
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If user context is updated, it will automatically trigger UI updates
    }, [user]);

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

    return (
        <div className="homepage-container">
            <header>
                <nav>
                    <a href="homepage" className="logo">Memo+</a>
                    <ul className="nav-links">
                        <li><a href="#">Library</a></li>
                        <li><a href="#">Create</a></li>
                        <li><a href="#">Streak</a></li>
                        <li><a href="#">Join</a></li>
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
            <main>
                <h1>Memo+</h1>
                <p>Learn Faster Using Only the Essentials</p>
            </main>
            <section className="guide">
                <h2>Guide</h2>
                <div className="guide-items">
                    <div className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/flashcards.png`} alt="Flashcard Logo" className="logo-image" />
                        <h3>Flashcards</h3>
                        <p>Create your own digital flashcards that flip with a click</p>
                    </div>
                    <div className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/learn-more.png`} alt="Learn More Logo" className="logo-image" />
                        <h3>Learn Mode</h3>
                        <p>An adaptive learning feature. Tracks what terms you know well and which terms need a little more work.</p>
                    </div>
                    <div className="guide-item">
                        <img src={`${process.env.PUBLIC_URL}/test.png`} alt="Test Logo" className="logo-image" />
                        <h3>Tests</h3>
                        <p>Test yourself in a stress-free environment before the real thing.</p>
                    </div>
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
