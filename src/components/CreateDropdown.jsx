import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Book, CheckSquare, Folder, Users } from 'lucide-react';
import './create-dropdown.css';

const CreateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="create-dropdown" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="create-button"
      >
        <span>+</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <Link to="/create" className="dropdown-item">
            <FileText />
            <span>Flashcard set</span>
          </Link>
          
          <Link to="/create-study-group" className="dropdown-item">
            <Book />
            <span>Study Group</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateDropdown;