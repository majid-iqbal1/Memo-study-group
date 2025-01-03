/******************************************************************************
*                        ProfileSidebar Component                             *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Sidebar for user profile management and account settings           *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
******************************************************************************/

/******************************** Features ************************************
*                                                                             *
* PROFILE MANAGEMENT        |   USER ACTIONS                                  *
* ------------------------- |   -----------------------------------------     *
* - Profile picture         |   - Edit name/bio                               *
* - User streak tracking    |   - Upload photo                                *
* - Bio information         |   - Sign out                                    *
* - Slide animations        |   - Close sidebar                               *
*                                                                             *
******************************************************************************/

import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../Firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import addIcon from '../assets/add-pic.png';
import '../styles/profilesidebar.css';

const ProfileSidebar = ({ onClose, onProfileUpdate }) => {
    // State for profile data, editing mode, and sidebar animation
    const [profile, setProfile] = useState({ name: '', bio: '', profilePictureURL: '', streak: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBio, setNewBio] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const user = auth.currentUser;

    // Fetch the user's profile data from Firestore on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const profileRef = doc(db, 'users', user.uid);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    const data = profileSnap.data();
                    const lastLogin = data.lastLogin?.toDate() || new Date();
                    const today = new Date();
                    
                    lastLogin.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    
                    const differenceInTime = today.getTime() - lastLogin.getTime();
                    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

                    if (differenceInDays >= 1) {
                        const newStreak = differenceInDays === 1 ? data.streak + 1 : 1;
                        await updateDoc(profileRef, {
                            streak: newStreak,
                            lastLogin: Timestamp.fromDate(today)
                        });
                        setProfile({ ...data, streak: newStreak });
                    } else {
                        setProfile(data);
                    }
                }
            }
        };
        fetchProfile();
        setTimeout(() => setIsVisible(true), 50);
    }, [user]);

    // Close the sidebar with an animation
    const handleClose = () => {
        setIsVisible(false);
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    // Handle profile picture upload to Firebase Storage
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

    // Save changes to the user's profile in Firestore
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

    // Sign the user out of the application
    const handleLogout = async () => {
        await signOut(auth);
    };

    // Determine the CSS classes for the sidebar based on visibility and animation state
    const sidebarClasses = `sidebar ${isVisible ? 'opening' : ''} ${isClosing ? 'closing' : ''}`;

    // Render the sidebar with the profile information and actions
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
                        {profile.bio && (
                            <p className="bio">
                                {profile.bio}
                            </p>
                        )}
                        <div className="streak-container">
                            <div className="streak-status">
                                <span role="img" aria-label="fire">🔥</span>
                                <p className="streak">
                                    {profile.streak === 0 ? (
                                        "Welcome! Start your streak"
                                    ) : (
                                        `Streak: ${profile.streak} ${profile.streak === 1 ? "day" : "days"}`
                                    )}
                                </p>
                            </div>
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
