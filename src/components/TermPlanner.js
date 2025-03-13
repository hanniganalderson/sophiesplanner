// src/components/TermPlanner.js
import React, { useState, useEffect } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const TermPlanner = () => {
  const { 
    plannedCourses, 
    addCourseToPlan, 
    removeCourseFromPlan,
    courses,
    calculateCredits,
    arePrerequisitesMet,
    completedCourses
  } = usePlannerContext();
  
  // State for course catalog
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Spring 2025');
  const [animateTerms, setAnimateTerms] = useState(false);
  
  // Trigger animation on mount
  useEffect(() => {
    setAnimateTerms(true);
  }, []);
  
  // Include Fall 2024 and Winter 2025
  const terms = [
    "Fall 2024",
    "Winter 2025",
    "Spring 2025",
    "Fall 2025",
    "Winter 2026",
    "Spring 2026",
    "Fall 2026",
    "Winter 2027",
    "Spring 2027",
    "Fall 2027",
    "Winter 2028",
    "Spring 2028"
  ];
  
  // Extract the season from a term (e.g., "Fall 2024" -> "Fall")
  const getSeasonFromTerm = (term) => {
    return term.split(' ')[0];
  };
  
  // Get missing prerequisites for a course
  const getMissingPrerequisites = (courseCode) => {
    const course = courses.find(c => c.course_code === courseCode);
    if (!course || !course.prerequisites || course.prerequisites.length === 0) {
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
  
  // Filter courses based on search term and selected term's season
  const filteredCourses = courses.filter(course => {
    // Filter by search term
    if (catalogFilter && 
        !course.course_code.toLowerCase().includes(catalogFilter.toLowerCase()) && 
        !course.title.toLowerCase().includes(catalogFilter.toLowerCase())) {
      return false;
    }
    
    // Filter by term availability - only show courses available in the selected term's season
    const selectedSeason = getSeasonFromTerm(selectedTerm);
    if (!course.terms_offered || !course.terms_offered.includes(selectedSeason)) {
      return false;
    }
    
    // Don't show completed courses
    if (completedCourses.includes(course.course_code)) {
      return false;
    }
    
    // Don't show courses already planned for this term
    if (plannedCourses[selectedTerm]?.includes(course.course_code)) {
      return false;
    }
    
    return true;
  });
  
  // Handle selecting a term
  const handleTermSelect = (term) => {
    setSelectedTerm(term);
    if (!showCatalog) {
      setShowCatalog(true); // Automatically show catalog when selecting a term
    }
  };
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Term Planner</h1>
      
      {/* Terms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {terms.map((term, index) => {
          const termCourses = plannedCourses[term] || [];
          const termCredits = calculateCredits(termCourses);
          const isSelected = selectedTerm === term;
          
          return (
            <div 
              key={term}
              className={`bg-white rounded-lg shadow-md p-4 border-t-4 
                ${isSelected ? 'border-primary-dark bg-primary-50' : 'border-primary'} 
                transition-all duration-300 hover:shadow-lg 
                ${animateTerms ? 'animate-fadeInUp' : ''} 
                cursor-pointer relative`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleTermSelect(term)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  Selected
                </div>
              )}
              
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">{term}</h2>
                <span className="text-sm font-medium text-gray-600">
                  {termCredits} credits
                </span>
              </div>
              
              {termCourses.length > 0 ? (
                <ul className="space-y-2">
                  {termCourses.map(courseCode => {
                    const course = courses.find(c => c.course_code === courseCode);
                    if (!course) return null;
                    
                    return (
                      <li key={courseCode} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-gray-800">{courseCode}</span>
                          <p className="text-xs text-gray-600">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.credits} credits</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent term selection when clicking remove
                            removeCourseFromPlan(courseCode, term);
                          }}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No courses planned for this term</p>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Course catalog section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Courses Available for {selectedTerm}
          </h2>
          
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors shadow-md"
          >
            {showCatalog ? 'Hide Courses' : 'Show Available Courses'}
          </button>
        </div>
        
        {showCatalog && (
          <div className="bg-white rounded-lg shadow-md p-4 animate-fadeIn">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCourses.map(course => {
                  const prereqsMet = arePrerequisitesMet(course.course_code);
                  
                  return (
                    <div key={course.course_code} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{course.course_code}</h3>
                          <p className="text-sm text-gray-700">{course.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{course.credits} credits</p>
                          
                          {/* Display all terms the course is offered in */}
                          <p className="text-xs text-gray-500 mt-1">
                            Available: {course.terms_offered ? course.terms_offered.join(', ') : 'Not specified'}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => addCourseToPlan(course.course_code, selectedTerm)}
                          disabled={!prereqsMet}
                          className={`text-xs px-2 py-1 rounded ${
                            !prereqsMet
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                          title={!prereqsMet ? 'Prerequisites not met' : ''}
                        >
                          Add to {selectedTerm}
                        </button>
                      </div>
                      
                      {!prereqsMet && (
                        <div className="mt-2 text-xs text-red-600">
                          <p className="font-medium">Prerequisites not met:</p>
                          <ul className="list-disc list-inside">
                            {getMissingPrerequisites(course.course_code).map((prereq, i) => (
                              <li key={i}>{prereq}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                No courses found for {selectedTerm} matching your search
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TermPlanner;