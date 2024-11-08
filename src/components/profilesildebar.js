import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import addIcon from '../assets/add-pic.png';

const ProfileSidebar = ({ onClose, onProfileUpdate }) => {
    const [profile, setProfile] = useState({ name: '', bio: '', profilePictureURL: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [error, setError] = useState("");

    const user = auth.currentUser;
    const storage = getStorage();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const profileRef = doc(db, 'users', user.uid);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setProfile(profileSnap.data());
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleProfilePictureUpload = async (file) => {
        if (!file) return;

        try {
            const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
            await uploadBytes(profilePictureRef, file);
            const downloadURL = await getDownloadURL(profilePictureRef);

            // Update Firestore with new profile picture URL
            const profileRef = doc(db, 'users', user.uid);
            await updateDoc(profileRef, { profilePictureURL: downloadURL });

            setProfile((prevProfile) => ({ ...prevProfile, profilePictureURL: downloadURL }));
            onProfileUpdate();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            setError("Failed to upload profile picture. Please try again.");
        }
    };

    const handleSave = async () => {
        if (user) {
            try {
                const profileRef = doc(db, 'users', user.uid);
                await updateDoc(profileRef, {
                    name: newName || profile.name,
                    bio: newBio || profile.bio,
                });
                setProfile({ 
                    name: newName || profile.name, 
                    bio: newBio || profile.bio, 
                    profilePictureURL: profile.profilePictureURL 
                });
                setIsEditing(false);
                onProfileUpdate();
            } catch (error) {
                console.error("Error saving profile:", error);
                setError("Failed to save profile. Please try again.");
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <div style={styles.sidebar}>
            <button onClick={onClose} style={styles.closeButton}>X</button>
            <div style={styles.profileContainer}>
                <div style={styles.profilePictureContainer}>
                    <img 
                        src={profile.profilePictureURL || addIcon} 
                        alt="Profile" 
                        style={styles.addIcon} 
                    />
                    <input 
                        type="file" 
                        style={styles.fileInput} 
                        onChange={(e) => handleProfilePictureUpload(e.target.files[0])} // Automatically upload on selection
                    />
                </div>

                <div style={styles.profileText}>
                    <h2 style={styles.name}>{profile.name || "User Name"}</h2>
                    {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
                </div>
            </div>
            {isEditing ? (
                <div style={styles.editContainer}>
                    <input
                        type="text"
                        placeholder="Enter new name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Enter new bio"
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={handleSave} style={styles.saveButton}>Save</button>
                    <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>Cancel</button>
                </div>
            ) : (
                <div style={styles.navLinks}>
                    <button onClick={() => setIsEditing(true)} style={styles.editButton}>Edit Profile</button>
                    <a href="/Homepage" style={styles.homeButton}>Home</a>
                    <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
                </div>
            )}
        </div>
    );
};

const styles = {
    sidebar: {
        position: 'fixed',
        right: 0,
        top: 0,
        width: '250px',
        height: '100vh',
        padding: '20px',
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: '#ecf0f1',
    },
    profileContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
    },
    profilePictureContainer: {
        position: 'relative',
        width: '120px', 
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#3c91e6', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    profilePicture: {
        width: '100%',
        height: '100%',
        objectFit: 'cover', 
    },
    initialsPlaceholder: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#3c91e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
    },
    addIcon: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
    },
    fileInput: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer',
    },
    
    editContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        outline: 'none',
        fontSize: '1rem',
    },
    saveButton: {
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#c0392b',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    navLinks: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    editButton: {
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    homeButton: {
        backgroundColor: '#3498db',  
        color: '#fff',
        padding: '10px',
        textAlign: 'center',
        textDecoration: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        color: '#fff',
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    profileText: {
        textAlign: 'center',
    },
    name: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
    bio: {
        fontSize: '1rem',
        marginTop: '10px',
        color: '#ecf0f1',
    },

    initialsPlaceholder: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#3c91e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
    },
};


export default ProfileSidebar;