import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import './style.css';

const Homepage = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/'); // Redirects to the sign-in page ("/" route in this example)
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div>
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
                <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
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
        </div>
    );
};

export default Homepage;
