// src/components/CourseCard.js
import React, { useState } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const CourseCard = ({ course, showActions = true, selectedTerm = null }) => {
  const { 
    completedCourses, 
    plannedCourses,
    markCourseCompleted,
    unmarkCourseCompleted,
    addCourseToPlan,
    removeCourseFromPlan,
    arePrerequisitesMet
  } = usePlannerContext();
  
  const [showDetails, setShowDetails] = useState(false);
  
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
    return '';
  };
  
  // Check if prerequisites are met
  const prereqsMet = arePrerequisitesMet(course.course_code);
  
  // Get missing prerequisites
  const getMissingPrerequisites = () => {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return [];
    }
    
    const missing = [];
    
    course.prerequisites.forEach(prereq => {
      if (prereq.includes(' or ')) {
        // Handle "or" conditions
        const options = prereq.split(' or ');
        const anyMet = options.some(option => completedCourses.includes(option.trim()));
        if (!anyMet) {
          missing.push(prereq);
        }
      } else if (!completedCourses.includes(prereq)) {
        missing.push(prereq);
      }
    });
    
    return missing;
  };
  
  // Handle marking course as completed
  const handleMarkCompleted = () => {
    if (isCompleted) {
      unmarkCourseCompleted(course.course_code);
    } else {
      markCourseCompleted(course.course_code);
      
      // If the course was planned, remove it from the plan
      if (isPlanned) {
        removeCourseFromPlan(course.course_code, getPlannedTerm());
      }
    }
  };
  
  // Handle adding course to plan
  const handleAddToPlan = () => {
    if (selectedTerm) {
      addCourseToPlan(course.course_code, selectedTerm);
    }
  };
  
  // Handle removing course from plan
  const handleRemoveFromPlan = () => {
    removeCourseFromPlan(course.course_code, getPlannedTerm());
  };
  
  // Format prerequisites for display
  const formatPrerequisites = (prerequisites) => {
    if (!prerequisites || prerequisites.length === 0) {
      return "None";
    }
    
    return prerequisites.map((prereq, index) => {
      // Handle "or" conditions in prerequisites
      if (prereq.includes(' or ')) {
        return prereq;
      }
      return prereq;
    }).join(', ');
  };
  
  const missingPrereqs = getMissingPrerequisites();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-t-4 border-primary hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{course.course_code}</h3>
        <div className="flex gap-1">
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
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mt-1">{course.title}</h4>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>{course.credits} credits</p>
        
        {course.instructor && (
          <p className="mt-1">
            <span className="font-medium">Instructor:</span> {course.instructor}
          </p>
        )}
        
        {/* Display all terms offered */}
        {course.terms_offered && course.terms_offered.length > 0 && (
          <p className="mt-1">
            <span className="font-medium">Available:</span> {course.terms_offered.join(', ')}
          </p>
        )}
        
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {!prereqsMet && !isCompleted && (
            <span className="text-xs text-red-600">
              Prerequisites not met
            </span>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 text-sm text-gray-600 border-t pt-4">
          {course.description && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-1">Description</h5>
              <p>{course.description}</p>
            </div>
          )}
          
          <div className="mb-3">
            <h5 className="font-medium text-gray-700 mb-1">Prerequisites</h5>
            <p>{formatPrerequisites(course.prerequisites)}</p>
            
            {missingPrereqs.length > 0 && !isCompleted && (
              <div className="mt-2 text-xs text-red-600">
                <p className="font-medium">Missing prerequisites:</p>
                <ul className="list-disc list-inside">
                  {missingPrereqs.map((prereq, i) => (
                    <li key={i}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {course.requirement_categories && course.requirement_categories.length > 0 && (
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-1">Fulfills Requirements</h5>
              <ul className="list-disc list-inside">
                {course.requirement_categories.map((category, i) => (
                  <li key={i}>{category}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {showActions && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {!isCompleted && !isPlanned && selectedTerm && (
            <button
              onClick={handleAddToPlan}
              disabled={!prereqsMet}
              className={`text-xs px-2 py-1 rounded ${
                !prereqsMet
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              Add to {selectedTerm}
            </button>
          )}
          
          {isPlanned && !isCompleted && (
            <button
              onClick={handleRemoveFromPlan}
              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
            >
              Remove from Plan
            </button>
          )}
          
          <button
            onClick={handleMarkCompleted}
            className={`text-xs px-2 py-1 rounded ${
              isCompleted
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCard;