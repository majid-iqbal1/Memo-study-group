import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../UserContext';
import ProfileSidebar from './profilesildebar';
import CreateDropdown from './CreateDropdown';

const NavLayout = ({ children }) => {
    const { user, loading } = useUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const getInitials = (name) => {
        if (!name) return "";
        const names = name.split(" ");
        return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    };

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
                    <CreateDropdown /> {/* Add the dropdown here */}
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