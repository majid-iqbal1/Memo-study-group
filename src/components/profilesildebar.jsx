import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import addIcon from '../assets/add-pic.png';
import '../styles/profilesidebar.css';

const ProfileSidebar = ({ onClose, onProfileUpdate }) => {
    const [profile, setProfile] = useState({ name: '', bio: '', profilePictureURL: '', streak: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

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
        setTimeout(() => setIsVisible(true), 50);
    }, [user]);

    const handleClose = () => {
        setIsVisible(false);
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleProfilePictureUpload = async (file) => {
        if (!file) return;

        try {
            const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
            await uploadBytes(profilePictureRef, file);
            const downloadURL = await getDownloadURL(profilePictureRef);

            const profileRef = doc(db, 'users', user.uid);
            await updateDoc(profileRef, { profilePictureURL: downloadURL });

            setProfile((prevProfile) => ({ ...prevProfile, profilePictureURL: downloadURL }));
            onProfileUpdate && onProfileUpdate();
        } catch (error) {
            console.error("Error uploading profile picture:", error);
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
                    ...profile,
                    name: newName || profile.name, 
                    bio: newBio || profile.bio, 
                });
                setIsEditing(false);
                onProfileUpdate && onProfileUpdate();
            } catch (error) {
                console.error("Error saving profile:", error);
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const sidebarClasses = `sidebar ${isVisible ? 'opening' : ''} ${isClosing ? 'closing' : ''}`;

    return (
        <>
            <div className="sidebar-overlay" onClick={handleClose} />
            <div className={sidebarClasses}>
                <button onClick={handleClose} className="closeButton">X</button>
                <div className="profileContainer">
                    <div className="profilePictureContainer">
                        <img 
                            src={profile.profilePictureURL || addIcon} 
                            alt="Profile" 
                            className="addIcon" 
                        />
                        <input 
                            type="file" 
                            className="fileInput" 
                            onChange={(e) => handleProfilePictureUpload(e.target.files[0])} 
                        />
                    </div>

                    <div className="profileText">
                        <h2 className="name">{profile.name || "User Name"}</h2>
                        <p className="bio">
                            {profile.bio || ""}
                        </p>
                        <div className="streak-container">
                            <span role="img" aria-label="fire">🔥</span>
                            <p className="streak">
                                Streak: {profile.streak > 0 ? `${profile.streak} ${profile.streak === 1 ? "day" : "days"}` : "No days yet"}
                            </p>
                        </div>
                    </div>
                </div>
                {isEditing ? (
                    <div className="editContainer">
                        <input
                            type="text"
                            placeholder="Enter new name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="input"
                        />
                        <input
                            type="text"
                            placeholder="Enter new bio"
                            value={newBio}
                            onChange={(e) => setNewBio(e.target.value)}
                            className="input"
                        />
                        <button onClick={handleSave} className="saveButton">Save</button>
                        <button onClick={() => setIsEditing(false)} className="cancelButton">Cancel</button>
                    </div>
                ) : (
                    <div className="navLinks">
                        <button onClick={() => setIsEditing(true)} className="editButton">Edit Profile</button>
                        <button onClick={handleLogout} className="logoutButton">Log Out</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProfileSidebar;