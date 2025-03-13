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
    arePrerequisitesMet
  } = usePlannerContext();
  
  // State for course catalog
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Winter 2025');
  const [animateTerms, setAnimateTerms] = useState(false);
  
  // Trigger animation on mount
  useEffect(() => {
    setAnimateTerms(true);
  }, []);
  
  // Only show terms from Winter 2025 onwards
  const terms = [
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
  
  // Filter courses for catalog
  const filteredCourses = courses.filter(course => {
    // Filter by search term
    if (catalogFilter && !course.course_code.toLowerCase().includes(catalogFilter.toLowerCase()) && 
        !course.title.toLowerCase().includes(catalogFilter.toLowerCase())) {
      return false;
    }
    
    // Only show Psychology and HDFS courses
    return course.course_code.startsWith('PSY') || course.course_code.startsWith('HDFS');
  });
  
  // Get course details
  const getCourseDetails = (courseCode) => {
    return courses.find(course => course.course_code === courseCode);
  };
  
  // Check prerequisites for a term
  const checkPrereqsForTerm = (courseCode, term) => {
    return arePrerequisitesMet(courseCode, term);
  };
  
  // Calculate credits for a term
  const getTermCredits = (termCourses) => {
    return termCourses.reduce((total, courseCode) => {
      const course = getCourseDetails(courseCode);
      return total + (course ? parseInt(course.credits) : 0);
    }, 0);
  };
  
  // Handle moving a course to a different term
  const moveCourse = (courseCode, fromTerm, toTerm) => {
    if (fromTerm !== toTerm) {
      removeCourseFromPlan(courseCode, fromTerm);
      addCourseToPlan(courseCode, toTerm);
    }
  };
  
  // Check if a course is already planned
  const isCoursePlanned = (courseCode) => {
    return Object.values(plannedCourses).some(termCourses => 
      termCourses.includes(courseCode)
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-primary mb-4 transition-all duration-300 hover:translate-y-[-2px]">Term Planner</h1>
        <p className="text-gray-600 mb-6">
          Plan your courses by term. Current term: <span className="font-medium text-primary">Winter 2025</span>
        </p>
        
        {/* Course Catalog Toggle */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-all duration-300 mb-4 md:mb-0 shadow-md hover:shadow-lg hover:translate-y-[-2px]"
          >
            {showCatalog ? 'Hide Course Catalog' : 'Show Course Catalog'}
          </button>
          
          <div className="text-sm text-gray-500">
            <span className="font-medium">Graduation Target:</span> June 2028
          </div>
        </div>
      </div>
      
      {/* Course Catalog */}
      <div 
        className={`${
          showCatalog ? 'animate-slideDown max-h-[800px]' : 'max-h-0 overflow-hidden opacity-0'
        } bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-primary transition-all duration-500 ease-in-out`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary mb-4 md:mb-0">Psychology & HDFS Course Catalog</h2>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search courses..."
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="term-select" className="block text-sm font-medium text-gray-700 mb-1">
            Add to Term:
          </label>
          <select
            id="term-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          >
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
          {filteredCourses.map((course, index) => {
            const isPlanned = isCoursePlanned(course.course_code);
            const prereqsMet = checkPrereqsForTerm(course.course_code, selectedTerm);
            
            return (
              <div 
                key={course.course_code} 
                className="border rounded-lg p-3 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className="font-mono text-xs text-gray-500">{course.course_code}</p>
                <p className="font-medium text-sm">{course.title}</p>
                <p className="text-xs text-gray-600 mt-1">{course.credits} credits</p>
                
                <div className="flex justify-between items-center mt-2">
                  <div>
                    {course.terms_offered && (
                      <span className="text-xs bg-secondary text-primary-dark px-2 py-0.5 rounded">
                        {course.terms_offered.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  {!isPlanned && (
                    <button
                      onClick={() => addCourseToPlan(course.course_code, selectedTerm)}
                      disabled={!prereqsMet}
                      className={`text-xs px-2 h-8 rounded-md transition-all duration-300 ${
                        prereqsMet 
                          ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-md' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  )}
                  
                  {isPlanned && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                      Planned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Term Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {terms.map((term, index) => {
          const termCourses = plannedCourses[term] || [];
          const termCredits = getTermCredits(termCourses);
          
          return (
            <div 
              key={term} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 border-primary transition-all duration-500 hover:shadow-lg ${animateTerms ? 'animate-fadeInUp' : 'opacity-0'}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-primary">{term}</h3>
                  <span className="text-sm text-gray-600">{termCredits} credits</span>
                </div>
              </div>
              
              <div className="p-4 min-h-[200px]">
                {termCourses.length > 0 ? (
                  <div className="space-y-3">
                    {termCourses.map((courseCode, courseIndex) => {
                      const course = getCourseDetails(courseCode);
                      const prereqsMet = checkPrereqsForTerm(courseCode, term);
                      
                      return course ? (
                        <div
                          key={courseCode}
                          className={`p-3 rounded-md border transition-all duration-300 hover:shadow-md animate-fadeIn`}
                          style={{ animationDelay: `${(index * 100) + (courseIndex * 50)}ms` }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono text-sm text-gray-500">{course.course_code}</p>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-gray-600">{course.credits} credits</p>
                              
                              {!prereqsMet && (
                                <p className="text-xs text-red-500 mt-1 animate-pulse">
                                  Prerequisites not met
                                </p>
                              )}
                              
                              <div className="mt-2">
                                <select
                                  className="text-xs border border-gray-300 rounded p-1 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      moveCourse(courseCode, term, e.target.value);
                                      e.target.value = "";
                                    }
                                  }}
                                >
                                  <option value="">Move to...</option>
                                  {terms.filter(t => t !== term).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeCourseFromPlan(courseCode, term)}
                              className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No courses planned for this term
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TermPlanner;