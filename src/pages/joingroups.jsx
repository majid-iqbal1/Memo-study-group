


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/joingroups.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  increment
} from "firebase/firestore";
import { auth, db } from "../firebase.jsx";
import { useUser } from "../UserContext.jsx";
import { Link } from "react-router-dom";
import NavLayout from "../components/NavLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import PopupNotification from "../components/PopupNotification";

const JoinGroups = () => {
  const { user, loading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [groupSets, setGroupSets] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [joinedGroups, setJoinedGroups] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, "group-database"));
        const querySnapshot = await getDocs(q);
        const sets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupSets(sets);
      } catch (error) {
        console.error("Error fetching group sets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  },[user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = groupSets.filter((group) =>
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


      setJoinedGroups((prev) => ({
        ...prev,
        [groupId]: true, // Mark group as joined
      }));

      setPopupMessage("Group joined!");
      setShowPopup(true);
      

      console.log("User added to group!");
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleGroupClick = (groupId) => {
    window.location.href = `https://www.youtube.com/watch?v=OgZzUJud3Q4&ab_channel=NiteReviews${groupId}`;
  };





  return (
    <NavLayout>
      <div className="join-groups-page">
        <div className="group-container-box">
          <h1>Join Study Groups</h1>

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
                        onClick={() => handleGroupClick(group.id)}
                      >
                        <div className="result-info">
                          
                          
                          
                          <span className="result-title">
                            {group.group?.name || "Unnamed Group"}
                          </span>
                          <span className="result-creator">
                            Owner: {group.group?.owner || "Unknown"}
                          </span>
                        </div>
                        <span className="member-count">
                          {group.group?.users?.length || 0} {group.group?.users?.length === 1 ? "member" : "members"}
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
              <button className="create-button">
                Create Your Own
              </button>
            </Link>
          </div>
        </div>

        <div className="quick-join-container">
          <h2>Quick Join Groups</h2>
          <div className="quick-join-boxes">
            {groupSets.map((group) => (
              <div className="quick-join-box" key={group.id}>
                <div className="group-image">
                  
                  <img 
                    src={group.group.groupImage}
                  
                    alt={group.group?.name || "Group Image"} 
                  />
                </div>
                <div className="box-title">
                  {group.group?.name || "Unnamed Group"}
                </div>
                <div className="member-count">
                  {group.group?.users?.length || 0} {group.group?.users?.length === 1 ? "member" : "members"}
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)} 
              
                  className="join-button"
                  disabled={joinedGroups[group.id]}
                >
                   {joinedGroups[group.id] ? "✅" : "Join"}
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