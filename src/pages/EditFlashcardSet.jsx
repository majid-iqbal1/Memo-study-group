/******************************************************************************
*                      EditFlashcardSet Component                             *
******************************************************************************/

/*************************** Component Information ****************************
*                                                                             *
* Purpose: Interface for editing and managing existing flashcard sets         *
* Created: November 2024                                                      *
* Updated: December 2024                                                      *
* Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich              *
*                                                                             *
*****************************************************************************/

/******************************** Features ************************************
*                                                                             *
* EDIT OPTIONS              |   CARD MANAGEMENT                               *
* ------------------------- |   ----------------------------------            *
* - Update title/desc       |   - Add/remove cards                            *
* - Save changes            |   - Edit terms/definitions                      *
* - Delete set              |   - Card validation                             *
* - Cancel edits            |   - Error handling                              *
*                                                                             *
*****************************************************************************/

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Firebase";
import NavLayout from "../components/NavLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/edit-flashcard.css";
import { X } from "lucide-react";

const EditFlashcardSet = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);

  // Effect to fetch the flashcard set data from Firestore
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const docRef = doc(db, "flashcardSets", setId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
          setCards(data.cards);
        } else {
          setError("Flashcard set not found");
        }
      } catch (error) {
        console.error("Error fetching flashcard set:", error);
        setError("Error loading flashcard set");
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSet();
  }, [setId]);

  // Function to save the updated flashcard set to Firestore
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your flashcard set");
      return;
    }

    if (cards.some((card) => !card.term.trim() || !card.definition.trim())) {
      alert("Please fill in all terms and definitions");
      return;
    }

    try {
      const docRef = doc(db, "flashcardSets", setId);
      await updateDoc(docRef, {
        title: title.trim(),
        description: description.trim(),
        cards: cards.map((card) => ({
          term: card.term.trim(),
          definition: card.definition.trim(),
        })),
        updatedAt: new Date(),
      });
      navigate("/library");
    } catch (error) {
      console.error("Error updating flashcard set:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  // Function to delete the flashcard set from Firestore
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this flashcard set? This action cannot be undone."
      )
    ) {
      try {
        await deleteDoc(doc(db, "flashcardSets", setId));
        navigate("/library");
      } catch (error) {
        console.error("Error deleting flashcard set:", error);
        alert("Failed to delete flashcard set. Please try again.");
      }
    }
  };

  // Function to add a new card to the flashcard set
  const handleAddCard = () => {
    setCards([...cards, { term: "", definition: "" }]);
  };

  // Function to delete a card from the flashcard set
  const handleDeleteCard = (index) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    } else {
      alert("You must have at least one card in the set");
    }
  };

  // Function to handle changes to a card's term or definition
  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Render the error message and a "Back to Library" button if an error occurred
  if (error) {
    return (
      <NavLayout>
        <div className="edit-flashcard-page">
          <div className="error-message">
            <p>{error}</p>
            <button
              onClick={() => navigate("/library")}
              className="back-button"
            >
              Back to Library
            </button>
          </div>
        </div>
      </NavLayout>
    );
  }

  // Render the error message and a "Back to Library" button if there are no errors.
  return (
    <NavLayout>
      <div className="edit-flashcard-page">
        <div className="edit-header">
          <h1>Edit Flashcard Set</h1>
          <div className="header-actions">
            <button
              onClick={() => navigate("/library")}
              className="cancel-button"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="save-button">
              Save Changes
            </button>
            <button onClick={handleDelete} className="delete-button">
              Delete Set
            </button>
          </div>
        </div>

        <div className="edit-form">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter set title"
            className="title-input"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter set description (optional)"
            className="description-input"
          />

          <div className="cards-list">
            {cards.map((card, index) => (
              <div key={index} className="card-edit-item">
                <span className="card-number">{index + 1}</span>
                <div className="card-inputs">
                  <input
                    type="text"
                    value={card.term}
                    onChange={(e) =>
                      handleCardChange(index, "term", e.target.value)
                    }
                    placeholder="Enter term"
                    className="term-input"
                  />
                  <input
                    type="text"
                    value={card.definition}
                    onChange={(e) =>
                      handleCardChange(index, "definition", e.target.value)
                    }
                    placeholder="Enter definition"
                    className="definition-input"
                  />
                </div>
                <button
                  onClick={() => handleDeleteCard(index)}
                  className="delete-icon"
                  disabled={cards.length === 1}
                  aria-label="Delete card"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleAddCard} className="add-card-button">
            + Add Card
          </button>
        </div>
      </div>
    </NavLayout>
  );
};

export default EditFlashcardSet;
