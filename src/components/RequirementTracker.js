// src/components/RequirementTracker.js
import React, { useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const RequirementTracker = ({ category, completedCourses, plannedCourses, courses }) => {
  const { calculateCredits } = usePlannerContext();
  
  // Move useMemo outside of any conditional logic
  const progress = useMemo(() => {
    if (!category) {
      return {
        requiredCredits: 0,
        completedCredits: 0,
        plannedCredits: 0,
        totalCredits: 0,
        completedPercentage: 0,
        plannedPercentage: 0,
        remainingCredits: 0
      };
    }
    
    const requiredCredits = category.required_credits || 0;
    
    // Get courses that fulfill this requirement
    const relevantCourses = courses.filter(course => 
      course.requirement_categories && 
      course.requirement_categories.includes(category.id)
    );
    
    // Get completed courses for this requirement
    const completedCoursesInCategory = completedCourses.filter(code => {
      const course = relevantCourses.find(c => c.course_code === code);
      return course !== undefined;
    });
    
    // Get planned courses for this requirement
    const plannedCoursesInCategory = [];
    Object.values(plannedCourses).forEach(termCourses => {
      termCourses.forEach(code => {
        if (!completedCourses.includes(code)) {
          const course = relevantCourses.find(c => c.course_code === code);
          if (course) {
            plannedCoursesInCategory.push(code);
          }
        }
      });
    });
    
    // Calculate credits
    const completedCredits = calculateCredits(completedCoursesInCategory);
    const plannedCredits = calculateCredits(plannedCoursesInCategory);
    const totalCredits = completedCredits + plannedCredits;
    
    // Calculate percentages
    const completedPercentage = Math.min(100, Math.round((completedCredits / requiredCredits) * 100)) || 0;
    const plannedPercentage = Math.min(100, Math.round((totalCredits / requiredCredits) * 100)) || 0;
    
    return {
      requiredCredits,
      completedCredits,
      plannedCredits,
      totalCredits,
      completedPercentage,
      plannedPercentage,
      remainingCredits: Math.max(0, requiredCredits - totalCredits)
    };
  }, [category, completedCourses, plannedCourses, courses, calculateCredits]);
  
  // Early return after useMemo
  if (!category) {
    return null;
  }
  
  return (
    <div className="butterfly-card requirement-tracker">
      <div className="butterfly-decoration top-right">
        <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 10C25 15 15 25 10 30C15 35 25 45 30 50C35 45 45 35 50 30C45 25 35 15 30 10Z" fill="#9C6ADE"/>
        </svg>
      </div>
      
      <div className="requirement-header">
        <h4 className="requirement-title">{category.name}</h4>
        <div className="requirement-credits">
          <span className="butterfly-badge completed">{progress.completedCredits}/{progress.requiredCredits} credits</span>
          {progress.plannedCredits > 0 && 
            <span className="butterfly-badge planned ml-2">+{progress.plannedCredits} planned</span>
          }
        </div>
      </div>
      
      <div className="butterfly-progress-container">
        <div 
          className="butterfly-progress-bar completed" 
          style={{ width: `${progress.completedPercentage}%` }}
        ></div>
        {progress.plannedCredits > 0 && (
          <div 
            className="butterfly-progress-bar planned" 
            style={{ 
              width: `${progress.plannedPercentage - progress.completedPercentage}%`,
              marginLeft: `${progress.completedPercentage}%`
            }}
          ></div>
        )}
      </div>
      
      {category.courses && category.courses.length > 0 && (
        <div className="requirement-courses mt-4">
          <div className="requirement-courses-label text-sm font-medium text-gray-600 mb-2">Required courses:</div>
          <ul className="requirement-courses-list grid grid-cols-1 md:grid-cols-2 gap-2">
            {category.courses.map(courseCode => {
              const isCompleted = completedCourses.includes(courseCode);
              const isPlanned = Object.values(plannedCourses).some(term => term.includes(courseCode));
              
              return (
                <li 
                  key={courseCode} 
                  className={`requirement-course-item p-2 rounded-md border ${
                    isCompleted ? 'border-green-200 bg-green-50' : 
                    isPlanned ? 'border-blue-200 bg-blue-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="course-code font-mono">{courseCode}</span>
                    {isCompleted && 
                      <span className="course-status text-green-600">✓</span>
                    }
                    {isPlanned && !isCompleted && 
                      <span className="course-status text-blue-600">⟳</span>
                    }
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RequirementTracker;