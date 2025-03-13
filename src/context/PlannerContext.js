// src/context/PlannerContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import plannerData from '../data/psychology_planner_data.json';

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
      
      // Validate that plannerData is properly loaded
      if (!plannerData || !plannerData.courses || !plannerData.degree_requirements) {
        throw new Error('Planner data is missing or invalid');
      }
      
      // Process the courses from the updated JSON structure
      const allCourses = plannerData.courses || [];
      
      // Map courses to the format expected by the application
      const processedCourses = allCourses.map(course => ({
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
      
      setCourses(processedCourses);
      setLoading(false);
    } catch (err) {
      console.error('Error loading planner data:', err);
      setError('Failed to load planner data. Please refresh the page.');
      setLoading(false);
    }
  }, []);
  
  // Save to localStorage when data changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('completedCourses', JSON.stringify(completedCourses));
      } catch (err) {
        console.error('Error saving completed courses:', err);
      }
    }
  }, [completedCourses, loading]);
  
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('plannedCourses', JSON.stringify(plannedCourses));
      } catch (err) {
        console.error('Error saving planned courses:', err);
      }
    }
  }, [plannedCourses, loading]);
  
  // Mark a course as completed - memoized to prevent unnecessary re-renders
  const markCourseCompleted = useCallback((courseCode) => {
    if (!completedCourses.includes(courseCode)) {
      setCompletedCourses(prev => [...prev, courseCode]);
      
      // Remove from planned courses if it exists there
      setPlannedCourses(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.keys(updated).forEach(term => {
          if (updated[term].includes(courseCode)) {
            updated[term] = updated[term].filter(code => code !== courseCode);
            changed = true;
          }
        });
        
        return changed ? updated : prev;
      });
    }
  }, [completedCourses]);
  
  // Unmark a completed course - memoized
  const unmarkCourseCompleted = useCallback((courseCode) => {
    setCompletedCourses(prev => prev.filter(code => code !== courseCode));
  }, []);
  
  // Add course to a specific term plan - memoized
  const addCourseToPlan = useCallback((courseCode, term) => {
    setPlannedCourses(prev => {
      const termCourses = prev[term] || [];
      
      if (!termCourses.includes(courseCode)) {
        // Remove from any other terms first
        const updated = { ...prev };
        let existsElsewhere = false;
        
        Object.keys(updated).forEach(existingTerm => {
          if (existingTerm !== term && updated[existingTerm].includes(courseCode)) {
            updated[existingTerm] = updated[existingTerm].filter(code => code !== courseCode);
            existsElsewhere = true;
          }
        });
        
        return {
          ...updated,
          [term]: [...termCourses, courseCode]
        };
      }
      
      return prev;
    });
  }, []);
  
  // Remove course from a term plan - memoized
  const removeCourseFromPlan = useCallback((courseCode, term) => {
    setPlannedCourses(prev => {
      const termCourses = prev[term] || [];
      
      if (termCourses.includes(courseCode)) {
        return {
          ...prev,
          [term]: termCourses.filter(code => code !== courseCode)
        };
      }
      
      return prev;
    });
  }, []);
  
  // Check if prerequisites are met - memoized
  const arePrerequisitesMet = useCallback((courseCode) => {
    const course = courses.find(c => c.course_code === courseCode);
    
    if (!course || !course.prerequisites || course.prerequisites.length === 0) {
      return true;
    }
    
    // Handle prerequisites that might be in the format "COURSE1 or COURSE2"
    return course.prerequisites.every(prereq => {
      if (prereq.includes(' or ')) {
        const options = prereq.split(' or ');
        return options.some(option => completedCourses.includes(option.trim()));
      }
      return completedCourses.includes(prereq);
    });
  }, [completedCourses, courses]);
  
  // Get course recommendations - memoized
  const getCourseRecommendations = useCallback(() => {
    // Filter for courses that have prerequisites met but aren't completed
    const availableCourses = courses.filter(course => 
      !completedCourses.includes(course.course_code) && 
      arePrerequisitesMet(course.course_code)
    );
    
    // Create a flat array of recommendations with category info
    const recommendations = [];
    
    Object.entries(plannerData.degree_requirements.psychology_bs.categories).forEach(([key, category]) => {
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
    
    // Sort by credits (ascending) to prioritize easier courses first
    return recommendations.sort((a, b) => parseInt(a.credits) - parseInt(b.credits));
  }, [completedCourses, arePrerequisitesMet, courses]);

  // Calculate total credits - memoized
  const calculateCredits = useCallback((courseCodes) => {
    if (!courseCodes || courseCodes.length === 0) return 0;
    
    return courseCodes.reduce((total, code) => {
      const course = courses.find(c => c.course_code === code);
      return total + (course ? course.credits : 0);
    }, 0);
  }, [courses]);
  
  // Get term offerings data - memoized
  const termOfferings = useMemo(() => {
    const offerings = {};
    
    // Group courses by term offered
    courses.forEach(course => {
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
  }, [courses]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    courses,
    degreeRequirements: plannerData.degree_requirements,
    termOfferings,
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
    loading,
    error
  }), [
    courses,
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
    error
  ]);
  
  // Make sure categories have required_credits
  if (contextValue.degreeRequirements) {
    Object.keys(contextValue.degreeRequirements).forEach(degreeKey => {
      const degree = contextValue.degreeRequirements[degreeKey];
      if (degree.categories) {
        Object.keys(degree.categories).forEach(categoryKey => {
          const category = degree.categories[categoryKey];
          if (!category.required_credits) {
            category.required_credits = 0;
          }
        });
      }
    });
  }
  
  // Update total credits to 180 everywhere
  if (contextValue.degreeRequirements) {
    Object.keys(contextValue.degreeRequirements).forEach(degreeKey => {
      const degree = contextValue.degreeRequirements[degreeKey];
      // Set total credits to 180
      degree.total_credits = 180;
    });
  }
  
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