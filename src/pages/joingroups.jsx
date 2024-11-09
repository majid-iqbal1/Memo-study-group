import React from 'react';
import '../styles/joingroups.css';
import NavLayout from '../components/NavLayout';

const JoinGroups = () => {
    return (
        <NavLayout>
        <div className="join-groups-page">
            <h1>Join Study Groups</h1>
            <p>Collaborate and learn with others by joining a study group.</p>
            <button className="join-button">Find Groups</button>
        </div>
        </NavLayout>
    );
};

export default JoinGroups;