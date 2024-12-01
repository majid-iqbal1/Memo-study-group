import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.jsx";
import "../styles/Homepage.css";
import { useUser } from "../UserContext.jsx";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import NavLayout from "../components/NavLayout";
import groupIcon from "../assets/group-icon.png";

const Homepage = () => {
  const { user, loading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [filteredSets, setFilteredSets] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      if (!user?.uid) return;
      setIsLoading(true);

      try {
        let q;
        if (searchMode === "my") {
          // Fetch only user's sets
          q = query(
            collection(db, "flashcardSets"),
            where("userId", "==", user.uid)
          );
        } else {
          // Fetch all sets
          q = query(collection(db, "flashcardSets"));
        }

        const querySnapshot = await getDocs(q);
        const sets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Sort by creation date (newest first)
        sets.sort((a, b) => b.createdAt - a.createdAt);
        setFlashcardSets(sets);
      } catch (error) {
        console.error("Error fetching flashcard sets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcardSets();
  }, [user, searchMode]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = flashcardSets.filter((set) =>
        set.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSets(filtered);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, flashcardSets]);

  const handleStudy = (set) => {
    navigate(`/learn?setId=${set.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavLayout>
      <div className="homepage-content">
        <h1>Memo+</h1>
        <p>Learn Faster Using Only the Essentials</p>

        <div className="search-container">
          <div className="search-header">
            <div className="search-mode-toggle">
              <button
                className={`mode-btn ${searchMode === "all" ? "active" : ""}`}
                onClick={() => setSearchMode("all")}
              >
                All Sets
              </button>
              <button
                className={`mode-btn ${searchMode === "my" ? "active" : ""}`}
                onClick={() => setSearchMode("my")}
              >
                My Sets
              </button>
            </div>
          </div>
          <div className="search-box-home">
            <input
              type="text"
              placeholder={`Search ${
                searchMode === "my" ? "your" : "all"
              } flashcard sets...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {isSearching && (
            <div className="search-results-home">
              <h2>Search Results</h2>
              {isLoading ? (
                <div className="loading-results">
                  <LoadingSpinner />
                </div>
              ) : filteredSets.length > 0 ? (
                <div className="results-list-home">
                  {filteredSets.map((set) => (
                    <div
                      key={set.id}
                      className="result-item-home"
                      onClick={() => handleStudy(set)}
                    >
                      <div className="result-info">
                        <span className="result-title">{set.title}</span>
                        <span className="result-creator">
                          by{" "}
                          {set.userId === user.uid
                            ? "You"
                            : set.createdBy || "Anonymous"}
                        </span>
                      </div>
                      <span className="card-count">
                        {set.cards?.length || 0} cards
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results-home">
                  <p>No flashcard sets matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="guide">
        <h2>Guide</h2>
        <div className="guide-items">
          <Link to="/create" className="guide-item">
            <img
              src={`${process.env.PUBLIC_URL}/flashcards.png`}
              alt="Flashcard Logo"
              className="logo-image"
            />
            <h3>Flashcards</h3>
            <p>Create your own digital flashcards that flip with a click</p>
          </Link>

          <Link to="/join" className="guide-item">
            <img src={groupIcon} alt="Join Group Logo" className="logo-image" />
            <h3>Join Groups</h3>
            <p>Join groups to study with friends and classmates</p>
          </Link>
          {/* <Link to="/learn" className="guide-item">
            <img
              src={`${process.env.PUBLIC_URL}/learn-more.png`}
              alt="Learn More Logo"
              className="logo-image"
            />
            <h3>Learn Mode</h3>
            <p>
              An adaptive learning feature. Tracks what terms you know well and
              which terms need a little more work.
            </p>
          </Link> */}

          <Link to="/tests" className="guide-item">
            <img
              src={`${process.env.PUBLIC_URL}/test.png`}
              alt="Test Logo"
              className="logo-image"
            />
            <h3>Tests</h3>
            <p>
              Test yourself in a stress-free environment before the real thing.
            </p>
          </Link>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Memo+</p>
      </footer>
    </NavLayout>
  );
};

export default Homepage;
