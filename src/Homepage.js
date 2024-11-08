import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import './style.css';
import ProfileSidebar from '../src/components/profilesildebar.js';

const Homepage = () => {
    const [userName, setUserName] = useState('');
    const [profilePictureURL, setProfilePictureURL] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserName = async () => {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserName(data.name || `${data.firstName} ${data.lastName}`);
                    setProfilePictureURL(data.profilePictureURL || null);
                }
            }
        };
        fetchUserName();
    }, []);

    const getInitials = (name) => {
        if (!name) return ""; // Return empty string if name is undefined or empty

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
                    <a href="index.html" className="logo">Memo+</a>
                    <ul className="nav-links">
                        <li><a href="#">Library</a></li>
                        <li><a href="#">Create</a></li>
                        <li><a href="#">Streak</a></li>
                        <li><a href="#">Join</a></li>
                    </ul>
                </nav>
                <div className="profile-container">
                    <span className="profile-name">{userName}</span>
                    <button className="profile-icon" onClick={openSidebar}>
                        {profilePictureURL ? (
                            <img src={profilePictureURL} alt="Profile" className="profile-icon-image" />
                        ) : (
                            <div className="initials-placeholder">{getInitials(userName)}</div>
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
