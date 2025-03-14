// src/context/PlannerContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import plannerData from '../data/psychology_planner_data.json';
import extractedCourses from '../data/extracted_courses.json';

const PlannerContext = createContext();

export const usePlannerContext = () => useContext(PlannerContext);

export const PlannerProvider = ({ children }) => {
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Store completed courses
  const [completedCourses, setCompletedCourses] = useState([]);
  
  // Store planned courses by term
  const [plannedCourses, setPlannedCourses] = useState({});

  // Store processed courses
  const [courses, setCourses] = useState([]);

  // Store search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterTerm, setFilterTerm] = useState('All Terms');
  
  // Add state for external courses
  const [externalCourses, setExternalCourses] = useState([]);
  const [showExternalCourses, setShowExternalCourses] = useState(true);
  
  // Load saved data from localStorage if available
  useEffect(() => {
    try {
      setLoading(true);
      
      const savedCompleted = localStorage.getItem('completedCourses');
      const savedPlanned = localStorage.getItem('plannedCourses');
      
      if (savedCompleted) {
        setCompletedCourses(JSON.parse(savedCompleted));
      }
      
      if (savedPlanned) {
        setPlannedCourses(JSON.parse(savedPlanned));
      }
      
      // Process the courses from the JSON structure
      let processedCourses = [];
      
      // Check if plannerData is properly loaded
      if (plannerData && plannerData.courses) {
        // Map courses to the format expected by the application
        processedCourses = plannerData.courses.map(course => ({
          ...course,
          // Ensure all required fields exist
          course_code: course.course_code || '',
          title: course.title || '',
          credits: course.credits || 0,
          description: course.description || '',
          prerequisites: course.prerequisites || [],
          // Ensure terms_offered is always an array, even if it's a single string in the data
          terms_offered: Array.isArray(course.terms_offered) ? course.terms_offered : 
                        (course.terms_offered ? [course.terms_offered] : []),
          category: course.category || '',
          requirement_categories: course.requirement_categories || []
        }));
      }
      
      setCourses(processedCourses);
      
      // Process external courses
      let processedExternalCourses = [];
      
      if (extractedCourses && Array.isArray(extractedCourses)) {
        processedExternalCourses = extractedCourses.map(course => {
          // Extract the course number to estimate credits
          const courseNumber = parseInt(course.course_code.split(' ')[1], 10) || 0;
          let credits = 4; // Default to 4 credits
          
          // Lower division courses (100-200 level) are often 3-4 credits
          // Upper division courses (300-400 level) are often 4 credits
          if (courseNumber < 300) {
            credits = 3;
          }
          
          return {
            ...course,
            credits,
            // Add a flag to identify as external course
            isExternalCourse: true,
            // Ensure terms_offered is always an array
            terms_offered: Array.isArray(course.terms_offered) ? course.terms_offered : 
                          (course.terms_offered ? [course.terms_offered] : ['Fall', 'Winter', 'Spring']),
            // Add empty prerequisites array
            prerequisites: [],
            // Add empty requirement categories
            requirement_categories: [],
            // Add empty description
            description: course.description || ''
          };
        });
      }
      
      setExternalCourses(processedExternalCourses);
      setLoading(false);
    } catch (err) {
      console.error('Error loading planner data:', err);
      setError('Failed to load planner data. Please refresh the page.');
      setLoading(false);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (completedCourses.length > 0) {
      localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
    }
    
    if (Object.keys(plannedCourses).length > 0) {
      localStorage.setItem('plannedCourses', JSON.stringify(plannedCourses));
    }
  }, [completedCourses, plannedCourses]);
  
  // Mark a course as completed
  const markCourseCompleted = useCallback((courseCode) => {
    setCompletedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev;
      }
      return [...prev, courseCode];
    });
  }, []);
  
  // Unmark a course as completed
  const unmarkCourseCompleted = useCallback((courseCode) => {
    setCompletedCourses(prev => prev.filter(code => code !== courseCode));
  }, []);
  
  // Add a course to a term plan
  const addCourseToPlan = useCallback((courseCode, term) => {
    setPlannedCourses(prev => {
      const updatedPlannedCourses = { ...prev };
      
      // Initialize the term array if it doesn't exist
      if (!updatedPlannedCourses[term]) {
        updatedPlannedCourses[term] = [];
      }
      
      // Add the course if it's not already in the term
      if (!updatedPlannedCourses[term].includes(courseCode)) {
        updatedPlannedCourses[term] = [...updatedPlannedCourses[term], courseCode];
      }
      
      return updatedPlannedCourses;
    });
  }, []);
  
  // Remove a course from a term plan
  const removeCourseFromPlan = useCallback((courseCode, term) => {
    setPlannedCourses(prev => {
      if (!prev[term] || !prev[term].includes(courseCode)) {
        return prev;
      }
      
      const updated = { ...prev };
      updated[term] = updated[term].filter(code => code !== courseCode);
      
      return updated;
    });
  }, []);
  
  // Toggle external courses visibility
  const toggleExternalCourses = useCallback(() => {
    // No-op, we always want to show external courses
    // Or you could just remove this function entirely
  }, []);
  
  // Get all courses (core + external if enabled)
  const getAllCourses = useCallback(() => {
    // Always return all courses, both core and external
    const allCourses = [...courses, ...externalCourses].map(course => {
      // Add common alternative names and tags for writing courses
      if (course.course_code.startsWith('WR ')) {
        return {
          ...course,
          tags: ['writing', 'composition', 'english'],
          alternative_names: [
            course.course_code.replace('WR ', 'writing '),
            course.course_code.replace('WR ', 'wr')
          ]
        };
      }
      
      // Add common alternative names for math courses
      if (course.course_code.startsWith('MTH ')) {
        return {
          ...course,
          tags: ['math', 'mathematics'],
          alternative_names: [
            course.course_code.replace('MTH ', 'math '),
            course.course_code.replace('MTH ', 'mth')
          ]
        };
      }
      
      // Add common alternative names for other courses
      return {
        ...course,
        tags: [],
        alternative_names: [
          course.course_code.replace(' ', '')
        ]
      };
    });
    
    return allCourses;
  }, [courses, externalCourses]);
  
  // Check if prerequisites are met for a course
  const arePrerequisitesMet = useCallback((courseCode) => {
    // First check if it's a core course
    const course = courses.find(c => c.course_code === courseCode);
    
    // If not found in core courses, check external courses
    if (!course) {
      const externalCourse = externalCourses.find(c => c.course_code === courseCode);
      // External courses don't have prerequisites defined, so return true
      if (externalCourse) {
        return true;
      }
      // If course not found at all, return false
      return false;
    }
    
    // If no prerequisites, return true
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return true;
    }
    
    // Check each prerequisite
    return course.prerequisites.every(prereq => {
      if (prereq.includes(' or ')) {
        // Handle "or" conditions
        const options = prereq.split(' or ');
        return options.some(option => completedCourses.includes(option.trim()));
      }
      
      return completedCourses.includes(prereq);
    });
  }, [completedCourses, courses, externalCourses]);
  
  // Calculate total credits for a list of course codes
  const calculateCredits = useCallback((courseCodes) => {
    if (!courseCodes || courseCodes.length === 0) return 0;
    
    return courseCodes.reduce((total, code) => {
      // First check in core courses
      const course = courses.find(c => c.course_code === code);
      if (course) {
        return total + (parseInt(course.credits, 10) || 0);
      }
      
      // If not found, check in external courses
      const externalCourse = externalCourses.find(c => c.course_code === code);
      if (externalCourse) {
        return total + (parseInt(externalCourse.credits, 10) || 0);
      }
      
      return total;
    }, 0);
  }, [courses, externalCourses]);
  
  // Get course recommendations based on completed courses
  const getCourseRecommendations = useCallback(() => {
    // Filter for courses that have prerequisites met but aren't completed
    const availableCourses = courses.filter(course => 
      !completedCourses.includes(course.course_code) && 
      arePrerequisitesMet(course.course_code)
    );
    
    // Create a flat array of recommendations with category info
    const recommendations = [];
    
    if (plannerData && plannerData.degree_requirements && plannerData.degree_requirements.psychology_bs) {
      Object.entries(plannerData.degree_requirements.psychology_bs.categories || {}).forEach(([key, category]) => {
        const categoryName = category.name;
        const coursesForCategory = availableCourses.filter(course => 
          course.requirement_categories && course.requirement_categories.includes(categoryName)
        );
        
        // Add each course with its category info
        coursesForCategory.forEach(course => {
          recommendations.push({
            ...course,
            category: categoryName,
            reason: `Fulfills ${categoryName} requirement`
          });
        });
      });
    }
    
    // Sort by credits (ascending) to prioritize easier courses first
    return recommendations.sort((a, b) => parseInt(a.credits) - parseInt(b.credits));
  }, [completedCourses, arePrerequisitesMet, courses]);
  
  // Get term offerings data
  const termOfferings = useMemo(() => {
    const offerings = {};
    
    // Group courses by term offered
    const allCourses = [...courses, ...externalCourses];
    
    allCourses.forEach(course => {
      if (course.terms_offered && course.terms_offered.length > 0) {
        course.terms_offered.forEach(term => {
          if (!offerings[term]) {
            offerings[term] = [];
          }
          offerings[term].push(course.course_code);
        });
      }
    });
    
    return offerings;
  }, [courses, externalCourses]);
  
  // Create the context value object with all the functions and data
  const contextValue = useMemo(() => {
    // Create a default degree requirements structure if missing
    const defaultDegreeRequirements = {
      psychology_bs: {
        total_credits: 180,
        categories: {}
      }
    };
    
    return {
      courses,
      externalCourses,
      completedCourses,
      plannedCourses,
      markCourseCompleted,
      unmarkCourseCompleted,
      addCourseToPlan,
      removeCourseFromPlan,
      arePrerequisitesMet,
      getCourseRecommendations,
      calculateCredits,
      searchTerm,
      setSearchTerm,
      filterCategory,
      setFilterCategory,
      filterTerm,
      setFilterTerm,
      termOfferings,
      loading,
      error,
      degreeRequirements: (plannerData && plannerData.degree_requirements) || defaultDegreeRequirements,
      showExternalCourses,
      toggleExternalCourses,
      getAllCourses
    };
  }, [
    courses,
    externalCourses,
    completedCourses,
    plannedCourses,
    markCourseCompleted,
    unmarkCourseCompleted,
    addCourseToPlan,
    removeCourseFromPlan,
    arePrerequisitesMet,
    getCourseRecommendations,
    calculateCredits,
    searchTerm,
    filterCategory,
    filterTerm,
    termOfferings,
    loading,
    error,
    showExternalCourses,
    toggleExternalCourses,
    getAllCourses
  ]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your degree planner...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <PlannerContext.Provider value={contextValue}>
      {children}
    </PlannerContext.Provider>
  );
};