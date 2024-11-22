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

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.uid) return;
      setIsLoading(true);
      try {
        const q = query(collection(db, "group-placeholder"));
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
  }, [user]);

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
  }, [searchTerm, groupSets]);

  const handleJoinGroup = async (groupId) => {
    if (!user?.uid) {
      console.log("User not logged in");
      return;
    }

    try {
      const groupRef = doc(db, "group-placeholder", groupId);
      await updateDoc(groupRef, {
        "group.users": arrayUnion(user.uid),
      });

      setPopupMessage("You have successfully joined the group!");
      setShowPopup(true);

      console.log("User added to group!");
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleGroupClick = (groupId) => {
    window.location.href = `https://www.youtube.com/watch?v=OgZzUJud3Q4&ab_channel=NiteReviews${groupId}`;
    //navigate(`/group/${groupId}`);
  };

  const handleCreateClick = (groupId) => {
    window.location.href = `https://www.youtube.com/watch?v=OgZzUJud3Q4&ab_channel=NiteReviews${groupId}`;
    //navigate(`/group/${groupId}`);
  };

  return (
    <NavLayout>
      <div className="join-groups-page">
        <div className="group-container-box">
          <h1>Join Study Groups</h1>
          {/* <p>Collaborate and learn with others by joining a study group.</p> */}

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
                        onClick={() => handleGroupClick(group.id)} // Add onClick to handle navigation
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
                          {group.group?.users?.length || 0} members
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
            <button
              onClick={() => handleCreateClick(1)}
              className="create-button"
            >
              Create Your Own
            </button>
          </div>
        </div>
        <div className="quick-join-container">
          <h2>Quick Join Groups</h2>
          <div className="quick-join-boxes">
            {groupSets.map((group) => (
              <div className="quick-join-box" key={group.id}>
                <div className="box-title">
                  {group.group?.name ? group.group.name : "No Name Available"}
                </div>
                <div className="box-details"></div>
                <div className="member-count">
                  {group.group?.users?.length || 0} members
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className="join-button"
                >
                  Join
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
