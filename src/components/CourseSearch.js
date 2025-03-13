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
    arePrerequisitesMet,
    termOfferings
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
    
    // Find the course in our courses array
    const course = courses.find(c => c.course_code === courseCode);
    if (!course) return [];
    
    // Otherwise use the data from the course object
    return Array.isArray(course.terms_offered) ? course.terms_offered : 
           (course.terms_offered ? [course.terms_offered] : []);
  };
  
  // Filter courses based on search, category, and term
  useEffect(() => {
    let filtered = courses;
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.course_code.toLowerCase().includes(search) || 
        course.title.toLowerCase().includes(search) ||
        (course.description && course.description.toLowerCase().includes(search))
      );
    }
    
    // Filter by category
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(course => {
        // Check main category
        if (course.category === categoryFilter) {
          return true;
        }
        
        // Check requirement categories
        if (course.requirement_categories && course.requirement_categories.includes(categoryFilter)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Filter by term
    if (termFilter !== 'All Terms') {
      filtered = filtered.filter(course => {
        // Use our special function to get terms for this course
        const courseTerms = getTermsForCourse(course.course_code);
        return courseTerms.includes(termFilter);
      });
    }
    
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
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Course Search</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search and filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search by course code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Term Offered</label>
            <select
              id="term"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Planning term selection */}
        <div className="mb-6">
          <label htmlFor="planningTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Add courses to term:
          </label>
          <select
            id="planningTerm"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {futurePlannableTerms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
        
        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600">
          Found {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
        </div>
        
        {/* Course list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.course_code} 
              course={course} 
              selectedTerm={selectedTerm}
            />
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No courses match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSearch;