// src/components/CourseCard.js
import React, { useState } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const CourseCard = ({ 
  course, 
  showActions = true, 
  selectedTerm = null,
  isCompleted,
  isPlanned,
  prereqsMet,
  onMarkCompleted,
  onUnmarkCompleted,
  onAddToPlan,
  plannableTerms,
  setSelectedTerm,
  termOfferings,
  showDetailsButton = true,
  showMarkCompletedButton = true
}) => {
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
  
  // Get the term this course is planned for
  const getPlannedTerm = () => {
    for (const [term, courses] of Object.entries(plannedCourses)) {
      if (courses.includes(course.course_code)) {
        return term;
      }
    }
    return '';
  };
  
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
  
  // Get terms for this course
  const getTermsForCourse = () => {
    // Ensure terms_offered is always an array
    if (!course.terms_offered) {
      return [];
    }
    
    return Array.isArray(course.terms_offered) 
      ? course.terms_offered 
      : [course.terms_offered];
  };
  
  // Get terms for this course
  const termsList = getTermsForCourse();
  
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
        
        {/* Display all terms */}
        {termsList.length > 0 && (
          <p className="mt-1">
            <span className="font-medium">Available:</span> {termsList.join(', ')}
          </p>
        )}
        
        <div className="mt-3 flex justify-between items-center">
          {showDetailsButton && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          )}
          
          {!prereqsMet && !isCompleted && (
            <span className="text-xs text-red-600">
              Prerequisites not met
            </span>
          )}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-4 text-sm border-t pt-4">
          <p className="mb-2">
            <span className="font-medium">Description:</span> {course.description || 'No description available.'}
          </p>
          
          <p className="mb-2">
            <span className="font-medium">Prerequisites:</span> {formatPrerequisites(course.prerequisites)}
          </p>
          
          {missingPrereqs.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 rounded-md">
              <p className="text-red-700 font-medium">Missing Prerequisites:</p>
              <ul className="list-disc pl-5 text-red-600">
                {missingPrereqs.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            {!isCompleted && !isPlanned && selectedTerm && (
              <button
                onClick={onAddToPlan}
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
                onClick={() => removeCourseFromPlan(course.course_code, getPlannedTerm())}
                className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
              >
                Remove from Plan
              </button>
            )}
            
            {showMarkCompletedButton && (
              <button
                onClick={isCompleted ? 
                  (onUnmarkCompleted || (() => unmarkCourseCompleted(course.course_code))) : 
                  (onMarkCompleted || (() => markCourseCompleted(course.course_code)))}
                className={`text-xs px-2 py-1 rounded ${
                  isCompleted
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;