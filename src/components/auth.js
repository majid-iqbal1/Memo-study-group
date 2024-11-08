import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const signIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
    }
};

const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth,googleProvider);
} catch (error) {
    console.error(error);
}
};

/* const logOut = async () => {
    try {
        await signOut(auth);
} catch (error) {
    console.error(error);
}
}; */

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h2 style={styles.heading}>Sign In</h2>
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
                <button style={styles.button} onClick={signIn}>Sign In</button>
                <button style={styles.Google_button} onClick={signInWithGoogle}> Sign In With Google</button>
            </div>
        </div>
    );
};
//<button onClick={logOut}>Sign Out</button>
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
        marginTop: '0.5rem',      // Smaller margin for tighter spacing
        padding: '0.5rem 1rem',   // Reduced padding for a smaller button size
        width: 'auto',            // Allows the button to fit the text content
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#4285F4', // Standard Google blue color for brand consistency
        color: '#ffffff',
        fontSize: '0.9rem',       // Slightly smaller font size
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    }
};
