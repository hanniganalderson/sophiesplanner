// src/components/CourseSearch.js
import React, { useState, useEffect, useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import CourseCard from './CourseCard';

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
  const [selectedTerm, setSelectedTerm] = useState('Spring 2025');
  
  // Get unique categories from requirement_categories and category fields
  const categories = useMemo(() => {
    const allCategories = new Set(['All Categories']);
    
    courses.forEach(course => {
      // Add the main category
      if (course.category) {
        allCategories.add(course.category);
      }
      
      // Add requirement categories
      if (course.requirement_categories && course.requirement_categories.length > 0) {
        course.requirement_categories.forEach(cat => allCategories.add(cat));
      }
    });
    
    return Array.from(allCategories);
  }, [courses]);
  
  // Get unique terms
  const terms = ['All Terms', 'Fall', 'Winter', 'Spring'];
  
  // Future terms for planning
  const futurePlannableTerms = [
    "Fall 2024",
    "Winter 2025",
    "Spring 2025",
    "Fall 2025",
    "Winter 2026",
    "Spring 2026",
    "Fall 2026"
  ];
  
  // Filter courses based on search and filters
  useEffect(() => {
    const filtered = courses.filter(course => {
      // Filter by search term
      if (searchTerm && !course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (categoryFilter !== 'All Categories') {
        const matchesMainCategory = course.category === categoryFilter;
        const matchesRequirementCategory = course.requirement_categories && 
          course.requirement_categories.includes(categoryFilter);
        
        if (!matchesMainCategory && !matchesRequirementCategory) {
          return false;
        }
      }
      
      // Filter by term
      if (termFilter !== 'All Terms') {
        if (!course.terms_offered || !course.terms_offered.includes(termFilter)) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredCourses(filtered);
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
      <h1 className="text-3xl font-bold text-primary mb-6">Course Search</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Courses
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code or title..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Term
            </label>
            <select
              id="term"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {terms.map(term => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          Found {filteredCourses.length} courses
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard 
            key={course.course_code} 
            course={course} 
          />
        ))}
      </div>
    </div>
  );
};

export default CourseSearch;