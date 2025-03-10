/******************************************************************************
*                           NavLayout Component                               *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Main navigation layout with header, sidebar and content area       *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* NAVIGATION                |   USER INTERFACE                                *
* ------------------------- |   --------------------------------------------- *          
* - Homepage                |   - Profile picture/initials                    *
* - Library                 |   - Sidebar toggle                              *
* - Study Groups            |   - Active route highlighting                   *
* - About & Contact         |   - Create content dropdown                     *
*                                                                             *
******************************************************************************/

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../UserContext';
import ProfileSidebar from './ProfileSildebar';
import CreateDropdown from './CreateDropdown';

const NavLayout = ({ children }) => {
    const { user, loading } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Determines if the current route matches the provided path
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    // Generates initials from the user's name
    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    };

    // Render the loading state if user data is still loading
    if (loading) return <div>Loading...</div>;

    return (
        <div className="nav-container">
            <header>
                <nav>
                    <div className="logo">
                        <img src="/logo.png" alt="Memo+ Logo" className="home-logo-image" />
                    </div>
                    <ul className="nav-links">
                        <li><Link to="/homepage" className={isActive('/homepage')}>Home</Link></li>
                        <li><Link to="/library" className={isActive('/library')}>Your Library</Link></li>
                        <li><Link to="/join" className={isActive('/join')}>Join Groups</Link></li>
                        <li><Link to="/about" className={isActive('/about')}>About Us</Link></li>
                        <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
                    </ul>
                </nav>
                <div className="profile-container">
                    <CreateDropdown /> {}
                    <span className="profile-name">{user ? user.name : 'User'}</span>
                    <button className="profile-icon" onClick={() => setIsSidebarOpen(true)}>
                        {user?.profilePictureURL ? (
                            <img src={user.profilePictureURL} alt="Profile" className="profile-icon-image" />
                        ) : (
                            <div className="initials-placeholder">{getInitials(user?.name)}</div>
                        )}
                    </button>
                </div>
            </header>

            <main className="page-content">
                {children}
            </main>

            {isSidebarOpen && <ProfileSidebar onClose={() => setIsSidebarOpen(false)} />}
        </div>
    );
};

export default NavLayout;