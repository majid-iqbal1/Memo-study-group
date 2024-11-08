import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // For confirmation during sign-up
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [error, setError] = useState(""); // For displaying error messages
    const navigate = useNavigate();

    // Password validation function
    const isValidPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[A-Za-z\d#?!@$%^&*-]{8,}$/;
        return regex.test(password);
    };

    const handleEmailAuth = async () => {
        setError(""); // Reset error message

        try {
            if (isSigningUp) {
                // Sign-up validations
                if (!isValidPassword(password)) {
                    setError("Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.");
                    return;
                }
                if (password !== confirmPassword) {
                    setError("Passwords do not match.");
                    return;
                }

                // Sign up with email and password
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                // Log in with email and password
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/homepage'); // Redirect after successful login or sign-up
        } catch (error) {
            // Handle Firebase authentication errors
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setError("Invalid-login-credentials).");
            } else {
                setError(error.message);
            }
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
        <div style={styles.pageContainer}>
            <main style={styles.mainContent}>
                <h1 style={styles.mainHeading}>Memo+</h1>
                <p style={styles.mainParagraph}>Learn Faster Using Only the Essentials</p>
            </main>
            <div style={styles.container}>
                <div style={styles.form}>
                    <h2 style={styles.heading}>{isSigningUp ? "Sign Up" : "Sign In"}</h2>
                    {error && <p style={styles.error}>{error}</p>}
                    
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
                    {isSigningUp && (
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Confirm Password.."
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}
                    <button style={styles.primaryButton} onClick={handleEmailAuth}>
                        {isSigningUp ? "Sign Up" : "Sign In"}
                    </button>
                    <p style={styles.toggleText}>
                        {isSigningUp ? "Already have an account? " : "Don’t have an account? "}
                        <span style={styles.toggleLink} onClick={() => setIsSigningUp(!isSigningUp)}>
                            {isSigningUp ? "Sign In" : "Sign Up"}
                        </span>
                    </p>
    
                    <div style={styles.divider}>
                        <span style={styles.dividerLine}></span>
                        <span style={styles.dividerText}>OR</span>
                        <span style={styles.dividerLine}></span>
                    </div>
    
                    <button style={styles.socialButton} onClick={signInWithGoogle}>
                        <img src={`${process.env.PUBLIC_URL}/google-icon.png`} alt="Google Icon" style={styles.icon} />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'flex-start', // Align items to the top of the container
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9',
        paddingTop: '2rem', // Add padding at the top to create space from the top of the screen
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2.5rem', // Increased padding for larger form size
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
        width: '350px', // Increased width for a larger form box
    },
    heading: {
        marginBottom: '1rem',
        fontSize: '1.5rem', // Adjust font size if needed
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
    primaryButton: {
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
    toggleText: {
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: '#555',
    },
    toggleLink: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        margin: '1rem 0', 
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#ddd',
    },
    dividerText: {
        margin: '0 0.5rem',
        fontSize: '0.8rem',
        color: '#888',
    },
    socialButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '0.5rem',
        marginTop: '0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontSize: '1rem',
        color: '#555',
    },
    icon: {
        width: '20px',
        height: '20px',
        marginRight: '10px',
    },
    error: {
        color: 'red',
        fontSize: '0.9rem',
        marginBottom: '1rem',
    },
    mainHeading: {
        fontSize: '4.5rem',
        fontWeight: 'bold',
        color: '#3c91e6',
        margin: '0',
    },
    mainParagraph: {
        fontSize: '1rem',
        color: '#555',
        marginTop: '0.5rem',
    },
};


