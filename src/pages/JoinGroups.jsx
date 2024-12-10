/******************************************************************************
*                          JoinGroups Component                               *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Interface for discovering and joining study groups                 *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* GROUP MANAGEMENT          |   USER INTERACTIONS                             *
* ------------------------- |   ----------------------------------            *
* - Search groups           |   - Join/leave groups                           *
* - View joined groups      |   - Enter group chats                           *
* - Group details           |   - Create new groups                           *
* - Member tracking         |   - Success notifications                       *
*                                                                             *
******************************************************************************/

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/joingroups.css";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import { db } from "../Firebase.jsx";
import { useUser } from "../UserContext.jsx";
import { Link } from "react-router-dom";
import NavLayout from "../components/NavLayout.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import PopupNotification from "../components/PopUpNotification.jsx";

const JoinGroups = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupSets, setGroupSets] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [joinedGroupIds, setJoinedGroupIds] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        // Fetch all groups
        const allGroupsQuery = query(collection(db, "group-database"));
        const querySnapshot = await getDocs(allGroupsQuery);
        const allGroups = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Separate joined and available groups
        const joined = allGroups.filter(group => 
          group.group?.users?.includes(user.uid)
        );
        let available = allGroups.filter(group => 
          !group.group?.users?.includes(user.uid)
        );
        console.log("size of avialble" +  available.length);
        if(available.length > 6)
        {
          let numberToRemove = available.length - 6;
          
          console.log("This is how many I should delete" + numberToRemove );
          available = available.slice(0, 6);
          console.log(available);
        }
        

        setJoinedGroups(joined);
        setGroupSets(available);

        // Create a map of joined group IDs
        const joinedIds = {};
        joined.forEach(group => {
          joinedIds[group.id] = true;
        });
        setJoinedGroupIds(joinedIds);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const allGroups = [...joinedGroups, ...groupSets];
      const filtered = allGroups.filter((group) =>
        group.group?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, groupSets, joinedGroups]);

  const handleJoinGroup = async (groupId) => {
    if (!user?.uid) {
      console.log("User not logged in");
      return;
    }

    try {
      const groupRef = doc(db, "group-database", groupId);
      await updateDoc(groupRef, {
        "group.users": arrayUnion(user.uid),
        "group.memberCount": increment(1),
      });

      setJoinedGroupIds((prev) => ({
        ...prev,
        [groupId]: true,
      }));

      // Move group from available to joined
      const groupToMove = groupSets.find(g => g.id === groupId);
      if (groupToMove) {
        setJoinedGroups(prev => [...prev, groupToMove]);
        setGroupSets(prev => prev.filter(g => g.id !== groupId));
      }

      setPopupMessage("Group joined successfully!");
      setShowPopup(true);

    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const navigateToChat = (groupId) => {
    navigate(`/chat/${groupId}`);
  };

  return (
    <NavLayout>
      <div className="join-groups-page">
        <div className="group-container-box">
          <h1>Study Groups</h1>

          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {isSearching && (
              <div className="search-results">
                <h2>Search Results</h2>
                {isLoading ? (
                  <div className="loading-results">
                    <LoadingSpinner />
                  </div>
                ) : filteredGroups.length > 0 ? (
                  <div className="results-list">
                    {filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className="result-item"
                        onClick={() => navigateToChat(group.id)}
                      >
                        <div className="result-info">
                          <span className="result-title">
                            {group.group?.name || "Unnamed Group"}
                          </span>
                          <span className="result-creator">
                            Owner: {group.createdBy?.name || "Unknown"}
                          </span>
                        </div>
                        <span className="member-count">
                          {group.group?.users?.length || 0}{" "}
                          {group.group?.users?.length === 1 ? "member" : "members"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No groups found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="create-own-container">
            <h2>or</h2>
            <Link to="/create-group">
              <button className="create-button">Create Your Own</button>
            </Link>
          </div>
        </div>

        {/* Your Groups Section */}
        {joinedGroups.length > 0 && (
          <div className="your-groups-container">
            <h2>Your Groups</h2>
            <div className="joined-groups-grid">
              {joinedGroups.map((group) => (
                <div
                  key={group.id}
                  className="joined-group-box"
                  onClick={() => navigateToChat(group.id)}
                >
                  <div className="group-image">
                    <img
                      src={group.group.groupImage || '/default-group-image.png'}
                      alt={group.group?.name}
                    />
                  </div>
                  <div className="group-info">
                    <h3>{group.group?.name || "Unnamed Group"}</h3>
                    <p>{group.group?.description}</p>
                    <span className="member-count">
                      {group.group?.users?.length || 0} members
                    </span>
                  </div>
                  <button className="enter-chat-button">
                    Enter Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Join Groups Section */}
        <div className="quick-join-container">
          <h2>Featured Study Groups</h2>
          <div className="quick-join-boxes">
            {groupSets.map((group) => (
              <div className="quick-join-box" key={group.id}>
                <div className="group-image">
                  <img
                    src={group.group.groupImage || '/default-group-image.png'}
                    alt={group.group?.name}
                  />
                </div>
                <div className="box-title">
                  {group.group?.name || "Unnamed Group"}
                </div>
                <div className="member-count">
                  {group.group?.users?.length || 0} members
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className="join-button"
                  disabled={joinedGroupIds[group.id]}
                >
                  {joinedGroupIds[group.id] ? "✓ Joined" : "Join"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {showPopup && (
          <PopupNotification
            message={popupMessage}
            onClose={() => setShowPopup(false)}
          />
        )}
      </div>
    </NavLayout>
  );
};

export default JoinGroups;
