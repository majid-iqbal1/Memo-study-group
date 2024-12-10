/**************************************************************************************** *
*                      CreateDropdown - Navigation Menu Component                         *
******************************************************************************************/

/********************************* Component Information **********************************
*                                                                                         *
* Purpose: Create dropdown menu for quick navigation to content creation pages            *
* Created: November 2024                                                                  *
* Updated: December 2024                                                                  *
* Author:  Majid Iqbal, Sulav Shakya, Bruce Duong, & Ethan Humrich                        *
*                                                                                         *
******************************************************************************************/

/*********************************** Menu Features ************************************* *
*                                                                                        *
* NAVIGATION                               | FUNCTIONALITY                               *
* ---------------------------------------- | ------------------------------------------- *
* - Create Flashcard Sets                  | - Toggle Dropdown                           *
* - Create Study Groups                    | - Click Outside Detection                   *
* - Create Tests                           | - Icon Integration                          *
*                                          |                                             *
******************************************************************************************/

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Book, CheckSquare, BookOpenCheck } from "lucide-react";
import "../styles/create-dropdown.css";

const CreateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="create-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="create-button-nav">
        <span>+</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <Link to="/create" className="dropdown-item">
            <FileText />
            <span>Flashcard set</span>
          </Link>

          <Link to="/create-group" className="dropdown-item">
            <Book />
            <span>Study Group</span>
          </Link>

          <Link to="/create-test" className="dropdown-item">
            <BookOpenCheck />
            <span>Create Test</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateDropdown;
