import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningUp, setIsSigningUp] = useState(false); // Track if user is in sign-up mode
    const navigate = useNavigate();

    const handleEmailAuth = async () => {
        try {
            if (isSigningUp) {
                // Sign up with email and password
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                // Log in with email and password
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/homepage'); // Redirect after successful sign up or login
        } catch (error) {
            console.error(error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/homepage'); // Redirect after Google sign-in
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h2 style={styles.heading}>{isSigningUp ? "Sign Up" : "Sign In"}</h2>
                <input
                    style={styles.input}
                    type="email"
                    placeholder="Email.."
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Password.."
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button style={styles.button} onClick={handleEmailAuth}>
                    {isSigningUp ? "Sign Up" : "Sign In"}
                </button>
                <button style={styles.Google_button} onClick={signInWithGoogle}>
                    Sign In With Google
                </button>
                <button
                    style={styles.toggleButton}
                    onClick={() => setIsSigningUp(!isSigningUp)}
                >
                    {isSigningUp ? "Already have an account? Sign In" : "Don’t have an account? Sign Up"}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f4f9',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        width: '300px',
    },
    heading: {
        marginBottom: '1rem',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        margin: '0.5rem 0',
        borderRadius: '4px',
        border: '1px solid #ddd',
        outline: 'none',
        fontSize: '1rem',
    },
    button: {
        marginTop: '1rem',
        padding: '0.75rem',
        width: '100%',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    Google_button: {
        marginTop: '0.5rem',
        padding: '0.5rem 1rem',
        width: 'auto',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#4285F4',
        color: '#ffffff',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    toggleButton: {
        marginTop: '1rem',
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textDecoration: 'underline',
    }
};
