/******************************************************************************
 *                        Create Flashcard Component                          *
 ******************************************************************************/

/*************************** Component Information ****************************
 *                                                                            *
 *  Purpose: Create and manage flashcard sets for study                       *
 *  Created: November 2024                                                    *
 *  Updated: December 2024                                                    *
 *  Authors: Majid Iqbal, Sulav Shakya, Bruce Duong, Ethan Humrich            *
 *                                                                            *
 *****************************************************************************/

/******************************** Features ************************************
 *                                                                            *
 *  FLASHCARD MANAGEMENT         |   USER INTERACTIONS                        *
 *  -------------------------    |   --------------------------------         *
 *  - Add/Remove cards           |   - Term input                             *
 *  - Set title                  |   - Definition input                       *
 *  - Set description            |   - Create set                             *
 *  - Card numbering             |   - Create and practice                    *
 *                                                                            *
 *  DATA HANDLING                |   VALIDATION                               *
 *  -------------------------    |   --------------------------------         *
 *  - Firebase storage           |   - Required fields check                  *
 *  - Timestamp tracking         |   - Empty card prevention                  *
 *  - User association           |   - Minimum card requirement               *
 *                                                                            *
 *****************************************************************************/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";
import { useUser } from "../UserContext";
import "../styles/create.css";
import NavLayout from "../components/NavLayout";
import { X } from "lucide-react";

const Create = () => {
  // State variables for flashcards, title, description, and submission status
  const [flashcards, setFlashcards] = useState([
    { id: 0, term: "", definition: "" },
  ]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

   // Function to add a new flashcard to the set
  const addCard = () => {
    const newId = flashcards.length;
    setFlashcards([...flashcards, { id: newId, term: "", definition: "" }]);
  };

  // Function to delete a flashcard from the set
  const deleteCard = (idToDelete) => {
    if (flashcards.length <= 1) {
      alert("You must have at least one flashcard.");
      return;
    }

    const updatedFlashcards = flashcards
      .filter((card) => card.id !== idToDelete)
      .map((card, index) => ({
        ...card,
        id: index,
      }));

    setFlashcards(updatedFlashcards);
  };

  // Function to handle changes to the term of a flashcard
  const handleTermChange = (id, value) => {
    setFlashcards(
      flashcards.map((card) =>
        card.id === id ? { ...card, term: value } : card
      )
    );
  };

  // Function to handle changes to the definition of a flashcard
  const handleDefinitionChange = (id, value) => {
    setFlashcards(
      flashcards.map((card) =>
        card.id === id ? { ...card, definition: value } : card
      )
    );
  };

  // Function to handle the creation of a new flashcard set
  const handleCreateSet = async (redirectToPractice = false) => {
    if (!title.trim()) {
      alert("Please enter a title for your flashcard set");
      return;
    }

    if (
      flashcards.some((card) => !card.term.trim() || !card.definition.trim())
    ) {
      alert("Please fill in all terms and definitions");
      return;
    }

    setIsSubmitting(true);

    try {
      const flashcardSet = {
        title: title.trim(),
        description: description.trim(),
        cards: flashcards.map(({ term, definition }) => ({ term, definition })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid,
        createdBy: user.name || "Anonymous",
      };

      const docRef = await addDoc(
        collection(db, "flashcardSets"),
        flashcardSet
      );

      if (redirectToPractice) {
        navigate(`/learn?setId=${docRef.id}`);
      } else {
        navigate("/library");
      }
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      alert("Failed to create flashcard set. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle the creation and immediate practice of a new flashcard set
  const handleCreateAndPractice = () => {
    handleCreateSet(true);
  };

  // Render the flashcard creator UI with the necessary inputs and buttons
  return (
    <NavLayout>
      <div className="flashcard-creator">
        <h1>Create a New Flashcard Set</h1>
        <p className="subtitle">
          Fill in the details below to create a flashcard set
        </p>

        <div className="creator-form">
          <input
            type="text"
            placeholder='Enter a title, like "Biology - Chapter 22: Evolution"'
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Add a description..."
            className="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {flashcards.map((card, index) => (
            <div key={card.id} className="flashcard-item">
              <div className="card-number">{index + 1}</div>
              <div className="card-content">
                <div className="card-inputs">
                  <input
                    type="text"
                    placeholder="Enter term"
                    className="term-input"
                    value={card.term}
                    onChange={(e) => handleTermChange(card.id, e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Enter definition"
                    className="definition-input"
                    value={card.definition}
                    onChange={(e) =>
                      handleDefinitionChange(card.id, e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  className="delete-icon"
                  onClick={() => deleteCard(card.id)}
                  disabled={flashcards.length <= 1}
                  aria-label="Delete flashcard"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}

          <button className="add-card-btn" onClick={addCard}>
            ADD A CARD
          </button>

          <div className="action-buttons">
            <button
              onClick={handleCreateSet}
              className="create-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
            <button
              onClick={handleCreateAndPractice}
              className="create-practice-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create and practice"}
            </button>
          </div>
        </div>
      </div>
    </NavLayout>
  );
};

export default Create;
