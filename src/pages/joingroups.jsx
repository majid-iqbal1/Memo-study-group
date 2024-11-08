import React from 'react';
import '../styles/joingroups.css';
import BackHomeNav from '../components/BackHomeNav';

const JoinGroups = () => {
    return (
        <div className="join-groups-page">
            <BackHomeNav />
            <h1>Join Study Groups</h1>
            <p>Collaborate and learn with others by joining a study group.</p>
            <button className="join-button">Find Groups</button>
        </div>
    );
};

export default JoinGroups;