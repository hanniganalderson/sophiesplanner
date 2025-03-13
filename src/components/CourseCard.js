// src/components/CourseCard.js
import React, { useState } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const CourseCard = ({ course, showActions = true }) => {
  const { 
    completedCourses, 
    plannedCourses,
    markCourseCompleted,
    unmarkCourseCompleted,
    addCourseToPlan,
    removeCourseFromPlan,
    arePrerequisitesMet
  } = usePlannerContext();
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  const isCompleted = completedCourses.includes(course.course_code);
  
  // Check if course is in any term plan
  const isPlanned = Object.values(plannedCourses).some(
    termCourses => termCourses.includes(course.course_code)
  );
  
  // Get the term this course is planned for
  const getPlannedTerm = () => {
    for (const [term, courses] of Object.entries(plannedCourses)) {
      if (courses.includes(course.course_code)) {
        return term;
      }
    }
    return null;
  };
  
  // Check if prerequisites are met
  const prereqsMet = arePrerequisitesMet(course.course_code);
  
  // Handle marking course as completed
  const handleMarkCompleted = () => {
    if (isCompleted) {
      unmarkCourseCompleted(course.course_code);
    } else {
      markCourseCompleted(course.course_code);
      
      // If the course was planned, remove it from the plan
      const plannedTerm = getPlannedTerm();
      if (plannedTerm) {
        removeCourseFromPlan(course.course_code, plannedTerm);
      }
    }
  };
  
  // Handle adding course to plan
  const handleAddToPlan = (term) => {
    addCourseToPlan(course.course_code, term);
    setShowDropdown(false);
  };
  
  // Handle removing course from plan
  const handleRemoveFromPlan = () => {
    const plannedTerm = getPlannedTerm();
    if (plannedTerm) {
      removeCourseFromPlan(course.course_code, plannedTerm);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
      style={{ 
        borderColor: isCompleted ? 'var(--success)' : isPlanned ? 'var(--primary)' : 'var(--border-medium)'
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-xs text-gray-600">{course.course_code}</p>
          <h3 className="font-medium text-primary-dark">{course.title}</h3>
          <p className="text-sm text-gray-700 mt-1">{course.credits} credits</p>
          
          {course.prerequisites && course.prerequisites.length > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-medium">Prerequisites:</span> {course.prerequisites.join(', ')}
            </p>
          )}
          
          {course.terms_offered && (
            <div className="mt-2 flex flex-wrap gap-1">
              {course.terms_offered.map(term => (
                <span key={term} className="text-xs bg-secondary text-primary-dark px-2 py-0.5 rounded-full">
                  {term}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {isCompleted && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Completed
          </span>
        )}
        
        {isPlanned && !isCompleted && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Planned: {getPlannedTerm()}
          </span>
        )}
      </div>
      
      {showActions && (
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleMarkCompleted}
            className={`text-xs px-3 py-1 rounded-md transition-all duration-300 ${
              isCompleted 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {isCompleted ? 'Unmark Completed' : 'Mark Completed'}
          </button>
          
          {!isCompleted && (
            <div className="relative dropdown">
              {isPlanned ? (
                <button
                  onClick={handleRemoveFromPlan}
                  className="text-xs px-3 py-1 rounded-md bg-red-100 text-red-800 hover:bg-red-200 transition-all duration-300"
                >
                  Remove from Plan
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={!prereqsMet}
                    className={`text-xs px-3 py-1 rounded-md flex items-center ${
                      prereqsMet 
                        ? 'bg-primary text-white hover:bg-primary-dark' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    } transition-all duration-300`}
                  >
                    Add to Plan
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="dropdown-menu animate-fadeIn">
                      <button 
                        onClick={() => handleAddToPlan('Fall 2024')}
                        className="dropdown-item"
                      >
                        Fall 2024
                      </button>
                      <button 
                        onClick={() => handleAddToPlan('Winter 2025')}
                        className="dropdown-item"
                      >
                        Winter 2025
                      </button>
                      <button 
                        onClick={() => handleAddToPlan('Spring 2025')}
                        className="dropdown-item"
                      >
                        Spring 2025
                      </button>
                      <button 
                        onClick={() => handleAddToPlan('Fall 2025')}
                        className="dropdown-item"
                      >
                        Fall 2025
                      </button>
                      <button 
                        onClick={() => handleAddToPlan('Spring 2026')}
                        className="dropdown-item"
                      >
                        Spring 2026
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;