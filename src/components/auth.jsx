import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; 
import '../styles/auth.css';

export const Auth = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [error, setError] = useState("");
    const { setUser } = useUser(); 
    const navigate = useNavigate();

    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{8,}$/;
        return regex.test(password);
    };

    const createUserProfile = async (user, firstName, lastName, photoURL = '') => {
        if (!user) return;
    
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
    
        if (!snapshot.exists()) {
            const { email } = user;
            const userData = {
                email,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`, 
                bio: '',
                profilePictureURL: photoURL,
                createdAt: new Date(),
                streakCount: 1, 
                lastLoginDate: new Date().toISOString().split('T')[0], 
            };
            await setDoc(userRef, userData);
    
            setUser({ uid: user.uid, ...userData });
        }
    };

    const updateStreak = async (user) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
    
        if (userSnap.exists()) {
            const data = userSnap.data();
            const lastLogin = data.lastLogin ? data.lastLogin.toDate() : null;
            const today = new Date();
            
            let newStreak = data.streak || 1;
            
            if (lastLogin) {
                const differenceInDays = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
    
                if (differenceInDays === 1) {
                    newStreak += 1;
                } else if (differenceInDays > 1) {
                    newStreak = 1; // Reset if more than one day passed
                }
            }
    
            await updateDoc(userRef, {
                streak: newStreak,
                lastLogin: Timestamp.fromDate(today)
            });
        }
    };
    
    const handleEmailAuth = async () => {
        setError("");
        try {
            let userCredential;
            if (isSigningUp) {
                if (!firstName.trim() || !lastName.trim()) {
                    setError("Please enter both first and last names.");
                    return;
                }
                if (!isValidPassword(password)) {
                    setError("Password must meet the security criteria.");
                    return;
                }
                if (password !== confirmPassword) {
                    setError("Passwords do not match.");
                    return;
                }
    
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await createUserProfile(user, firstName, lastName);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
    
            const user = userCredential.user;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
                setUser({ uid: user.uid, ...userSnap.data() });
                await updateStreak(user);  // Update streak here after retrieving user data
            }
    
            navigate('/homepage');
        } catch (error) {
            setError("An error occurred. Please try again.");
            console.error(error);
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
    
            const firstName = user.displayName?.split(' ')[0] || '';
            const lastName = user.displayName?.split(' ')[1] || '';
            const photoURL = user.photoURL || '';
    
            await createUserProfile(user, firstName, lastName, photoURL);
    
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
                setUser({ uid: user.uid, ...userSnap.data() });
                await updateStreak(user);
            }
    
            navigate('/homepage');
        } catch (error) {
            setError("Google sign-in failed. Please try again.");
            console.error(error);
        }
    };

    const handleWelcomeClick = () => {
        setIsSigningUp(true); // Switch to sign-up mode
    };
    
    return (
        <div className="pageContainer">
            <div className="mainGrid">
                <div className="leftColumn">
                    <div className="brandSection">
                        <h1 className="mainHeading">Memo+</h1>
                        <p className="mainParagraph">Learn Faster Using Only the Essentials</p>
                    </div>

                    <div 
                        className="welcomeSection"
                        onClick={handleWelcomeClick}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleWelcomeClick();
                        }}
                    >
                        <h2 className="welcomeHeading">New Here?</h2>
                        <p className="welcomeText">
                            Sign up and discover a great amount of new opportunities!
                        </p>
                        <span className="welcomeSignUp">
                            Sign Up →
                        </span>
                    </div>
                </div>

                <div className="rightColumn">
                <div className="form">
                    <h2 className="heading">{isSigningUp ? "Sign Up" : "Sign In"}</h2>
    
                    {error && <p className="error">{error}</p>}
    
                    {isSigningUp && (
                        <>
                            <input
                                className="input"
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <input
                                className="input"
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </>
                    )}
    
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
    
                    {isSigningUp && (
                        <input
                            className="input"
                            type="password"
                            placeholder="Confirm Password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}
    
                    <button className="primaryButton" onClick={handleEmailAuth}>
                        {isSigningUp ? "Sign Up" : "Sign In"}
                    </button>
    
                    <p className="toggleText">
                        {isSigningUp ? "Already have an account? " : "Don’t have an account? "}
                        <span className="toggleLink" onClick={() => setIsSigningUp(!isSigningUp)}>
                            {isSigningUp ? "Sign In" : "Sign Up"}
                        </span>
                    </p>
    
                    <div className="divider">
                        <span className="dividerLine"></span>
                        <span className="dividerText">OR</span>
                        <span className="dividerLine"></span>
                    </div>
    
                    <button className="socialButton" onClick={signInWithGoogle}>
                        <img src={`${process.env.PUBLIC_URL}/google-icon.png`} alt="Google Icon" className="icon" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
    
};

export default Auth;