// src/components/CourseCard.js
import React from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import { useSpring, animated } from '@react-spring/web';

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
    markCourseCompleted(course.course_code);
  };
  
  // Handle unmarking course as completed
  const handleUnmarkCompleted = () => {
    unmarkCourseCompleted(course.course_code);
  };
  
  // Handle adding course to a term
  const handleAddToPlan = (term) => {
    addCourseToPlan(course.course_code, term);
  };
  
  // Handle removing course from plan
  const handleRemoveFromPlan = () => {
    const term = getPlannedTerm();
    if (term) {
      removeCourseFromPlan(course.course_code, term);
    }
  };
  
  // Hover animation
  const [props, set] = useSpring(() => ({
    transform: 'scale(1)',
    boxShadow: '0 4px 6px rgba(123, 63, 242, 0.1)',
    config: { mass: 1, tension: 350, friction: 40 }
  }));
  
  return (
    <animated.div 
      style={props}
      onMouseEnter={() => set({ transform: 'scale(1.02)', boxShadow: '0 10px 15px rgba(123, 63, 242, 0.15)' })}
      onMouseLeave={() => set({ transform: 'scale(1)', boxShadow: '0 4px 6px rgba(123, 63, 242, 0.1)' })}
      className={`bg-white rounded-lg p-4 border-l-4 ${
        isCompleted ? 'border-success' : 
        isPlanned ? 'border-primary' : 
        'border-gray-300'
      }`}
    >
      <div className="butterfly-course-header">
        <div>
          <h3 className="butterfly-course-title">{course.title}</h3>
          <div className="butterfly-course-code">{course.course_code}</div>
        </div>
        <div className="butterfly-course-credits">{course.credits} credits</div>
      </div>
      
      <div className="butterfly-course-description">
        {course.description}
      </div>
      
      {course.prerequisites && course.prerequisites.length > 0 && (
        <div className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Prerequisites:</span>{' '}
          {course.prerequisites.join(', ')}
        </div>
      )}
      
      {course.terms_offered && course.terms_offered.length > 0 && (
        <div className="butterfly-course-terms mb-3">
          {course.terms_offered.map(term => (
            <span key={term} className="butterfly-course-term">
              {term}
            </span>
          ))}
        </div>
      )}
      
      {showActions && (
        <div className="butterfly-course-footer">
          <div>
            {isCompleted ? (
              <span className="butterfly-badge completed">Completed</span>
            ) : isPlanned ? (
              <span className="butterfly-badge planned">Planned for {getPlannedTerm()}</span>
            ) : !prereqsMet ? (
              <span className="butterfly-badge" style={{backgroundColor: 'var(--warning)', color: 'var(--text-primary)'}}>
                Prerequisites not met
              </span>
            ) : null}
          </div>
          
          <div className="butterfly-course-actions">
            {isCompleted ? (
              <button 
                onClick={handleUnmarkCompleted}
                className="butterfly-btn butterfly-btn-outline text-xs py-1 px-2"
              >
                Unmark Completed
              </button>
            ) : (
              <button 
                onClick={handleMarkCompleted}
                className="butterfly-btn butterfly-btn-primary text-xs py-1 px-2"
                disabled={!prereqsMet}
              >
                Mark Completed
              </button>
            )}
            
            {isPlanned ? (
              <button 
                onClick={handleRemoveFromPlan}
                className="butterfly-btn butterfly-btn-outline text-xs py-1 px-2"
              >
                Remove from Plan
              </button>
            ) : !isCompleted && (
              <div className="relative inline-block">
                <button 
                  className="butterfly-btn butterfly-btn-secondary text-xs py-1 px-2"
                  disabled={!prereqsMet}
                >
                  Add to Term
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div className="py-1">
                    <button 
                      onClick={() => handleAddToPlan('Fall 2024')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Fall 2024
                    </button>
                    <button 
                      onClick={() => handleAddToPlan('Spring 2025')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Spring 2025
                    </button>
                    <button 
                      onClick={() => handleAddToPlan('Fall 2025')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Fall 2025
                    </button>
                    <button 
                      onClick={() => handleAddToPlan('Spring 2026')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Spring 2026
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </animated.div>
  );
};

export default CourseCard;