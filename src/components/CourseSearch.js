// src/components/CourseSearch.js
import React, { useState, useEffect } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const CourseSearch = () => {
  const { 
    courses, 
    completedCourses, 
    plannedCourses,
    markCourseCompleted,
    addCourseToPlan,
    arePrerequisitesMet
  } = usePlannerContext();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [termFilter, setTermFilter] = useState('All Terms');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('Winter 2025');
  
  // Get unique categories
  const categories = ['All Categories', ...new Set(courses.flatMap(course => 
    course.requirement_categories || []
  ))];
  
  // Get unique terms
  const terms = ['All Terms', 'Fall', 'Winter', 'Spring'];
  
  // Future terms for planning
  const futurePlannableTerms = [
    "Winter 2025",
    "Spring 2025",
    "Fall 2025",
    "Winter 2026",
    "Spring 2026"
  ];
  
  // Filter courses based on search and filters
  useEffect(() => {
    let results = [...courses];
    
    // Apply search term filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(course => 
        course.course_code.toLowerCase().includes(search) ||
        course.title.toLowerCase().includes(search) ||
        (course.description && course.description.toLowerCase().includes(search))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'All Categories') {
      results = results.filter(course => 
        course.requirement_categories && 
        course.requirement_categories.includes(categoryFilter)
      );
    }
    
    // Apply term filter
    if (termFilter !== 'All Terms') {
      results = results.filter(course => 
        course.terms_offered && 
        course.terms_offered.includes(termFilter)
      );
    }
    
    setFilteredCourses(results);
  }, [searchTerm, categoryFilter, termFilter, courses]);
  
  // Check if a course is completed
  const isCourseCompleted = (courseCode) => {
    return completedCourses.includes(courseCode);
  };
  
  // Check if a course is planned
  const isCoursePlanned = (courseCode) => {
    return Object.values(plannedCourses).some(termCourses => 
      termCourses.includes(courseCode)
    );
  };
  
  // Handle adding a course to a term
  const handleAddToTerm = (courseCode) => {
    if (selectedTerm) {
      addCourseToPlan(courseCode, selectedTerm);
    }
  };
  
  // Handle marking a course as completed
  const handleMarkCompleted = (courseCode) => {
    markCourseCompleted(courseCode);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">Course Search</h1>
      <p className="text-gray-600 mb-6">
        Search for courses to add to your degree plan. Current term: <span className="font-medium text-primary">Winter 2025</span>
      </p>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by course code or title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
              Term Offered
            </label>
            <select
              id="term"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Add to Term Selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {filteredCourses.length} courses found
        </div>
        
        <div className="flex items-center">
          <label htmlFor="add-to-term" className="block text-sm font-medium text-gray-700 mr-2">
            Add selected to:
          </label>
          <select
            id="add-to-term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          >
            {futurePlannableTerms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Course Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map(course => {
          const isCompleted = isCourseCompleted(course.course_code);
          const isPlanned = isCoursePlanned(course.course_code);
          const prereqsMet = arePrerequisitesMet(course.course_code);
          
          return (
            <div 
              key={course.course_code} 
              className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${
                isCompleted ? 'border-green-500' : 
                isPlanned ? 'border-blue-500' : 
                'border-primary'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{course.course_code}</p>
                    <h3 className="font-medium text-lg">{course.title}</h3>
                  </div>
                  <span className="bg-primary-light text-white text-xs px-2 py-1 rounded-full">
                    {course.credits} credits
                  </span>
                </div>
                
                {course.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {course.description}
                  </p>
                )}
                
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Prerequisites: {course.prerequisites.join(', ')}
                    </p>
                  </div>
                )}
                
                {course.terms_offered && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.terms_offered.map(term => (
                      <span 
                        key={term} 
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                {isCompleted ? (
                  <span className="text-green-600 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                ) : isPlanned ? (
                  <span className="text-blue-600 text-sm font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Planned
                  </span>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMarkCompleted(course.course_code)}
                      disabled={!prereqsMet}
                      className={`text-xs px-2 py-1 rounded ${
                        prereqsMet 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Mark Completed
                    </button>
                    
                    <button
                      onClick={() => handleAddToTerm(course.course_code)}
                      disabled={!prereqsMet}
                      className={`text-xs px-2 py-1 rounded ${
                        prereqsMet 
                          ? 'bg-primary text-white hover:bg-primary-dark' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Add to {selectedTerm}
                    </button>
                  </div>
                )}
                
                {!prereqsMet && !isCompleted && (
                  <span className="text-red-500 text-xs">
                    Prerequisites not met
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">No courses found matching your criteria</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;