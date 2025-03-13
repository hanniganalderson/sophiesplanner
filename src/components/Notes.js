import React, { useState, useEffect } from 'react';

const Notes = () => {
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('sophiePsychologyNotes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);
  
  // Save notes to localStorage
  const saveNotes = () => {
    localStorage.setItem('sophiePsychologyNotes', notes);
    setIsSaved(true);
    
    // Show saved indicator
    const savedIndicator = document.getElementById('saved-indicator');
    savedIndicator.classList.remove('opacity-0');
    setTimeout(() => {
      savedIndicator.classList.add('opacity-0');
    }, 2000);
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeInUp">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Your Notes</h2>
        <div className="flex items-center">
          <span id="saved-indicator" className="text-xs text-green-500 mr-3 transition-opacity duration-300 opacity-0">
            Saved!
          </span>
          <button 
            onClick={saveNotes}
            disabled={isSaved}
            className={`px-3 py-1 rounded text-sm ${
              isSaved 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark'
            } transition-all duration-300`}
          >
            Save
          </button>
        </div>
      </div>
      
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Write notes to your future self, or jot down important psychology concepts..."
        className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
      ></textarea>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Your notes are saved locally and will be available when you return.</p>
      </div>
    </div>
  );
};

export default Notes; 