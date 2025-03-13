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
  
  // MANUAL FIX: Special handling for courses with multiple terms
  const getTermsForCourse = (courseCode) => {
    // Courses with multiple terms
    const multiTermCourses = {
      'PSY 202Z': ['Fall', 'Spring'],
      'PSY 401': ['Fall', 'Winter', 'Spring'],
      'PSY 410': ['Fall', 'Winter', 'Spring'],
      'HDFS 201': ['Fall', 'Spring'],
      'HDFS 262': ['Winter', 'Spring'],
      'HDFS 310': ['Fall', 'Winter', 'Spring'],
      'HDFS 401': ['Fall', 'Winter', 'Spring'],
      'HDFS 405': ['Fall', 'Winter', 'Spring'],
      'HDFS 406': ['Fall', 'Winter', 'Spring'],
      'HDFS 447': ['Fall', 'Winter', 'Spring'],
      'HDFS 469': ['Fall', 'Winter', 'Spring']
    };
    
    // If it's a special course, use our manual list
    if (multiTermCourses[courseCode]) {
      return multiTermCourses[courseCode];
    }
    
    // Otherwise use the data from the course object
    return Array.isArray(course.terms_offered) ? course.terms_offered : 
           (course.terms_offered ? [course.terms_offered] : []);
  };
  
  // Get terms for this course
  const termsList = getTermsForCourse(course.course_code);
  
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
        
        {/* Display all terms with our manual fix */}
        {termsList.length > 0 && (
          <p className="mt-1">
            <span className="font-medium">Available:</span> {termsList.join(', ')}
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
        </div>
      )}
    </div>
  );
};

export default CourseCard;