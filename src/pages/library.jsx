import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "../UserContext";
import NavLayout from "../components/NavLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/library.css";

const Library = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchFlashcardSets = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, "flashcardSets"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const sets = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFlashcardSets(sets);
    } catch (error) {
      console.error("Error fetching flashcard sets:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);

  const handleStudy = (set) => {
    navigate(`/learn?setId=${set.id}`);
  };

  const handleEdit = (e, set) => {
    e.stopPropagation();
    navigate(`/edit/${set.id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavLayout>
      <div className="library-page">
        <h1>Your Library</h1>
        {flashcardSets.length === 0 ? (
          <div className="empty-library">
            <p>You haven't created any flashcard sets yet.</p>
            <button
              onClick={() => navigate("/create")}
              className="create-button"
            >
              Create Your First Set
            </button>
          </div>
        ) : (
          <div className="flashcard-sets">
            {flashcardSets.map((set) => (
              <div
                key={set.id}
                className="flashcard-set-card"
                onClick={() => handleStudy(set)}
                style={{ cursor: "pointer" }}
              >
                <h3>{set.title}</h3>
                <p>{set.description}</p>
                <div className="set-info">
                  <span>{set.cards.length} cards</span>
                  <div className="set-actions">
                    <button
                      onClick={() => handleStudy(set)}
                      className="view-button"
                    >
                      Study
                    </button>
                    <button
                      onClick={(e) => handleEdit(e, set)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  );
};

export default Library;
