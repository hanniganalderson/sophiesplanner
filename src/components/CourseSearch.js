// src/components/CourseSearch.js
import React, { useState, useEffect, useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import CourseCard from './CourseCard';

const CourseSearch = () => {
  const { 
    completedCourses, 
    plannedCourses,
    markCourseCompleted,
    unmarkCourseCompleted,
    addCourseToPlan,
    removeCourseFromPlan,
    arePrerequisitesMet,
    termOfferings,
    getAllCourses
  } = usePlannerContext();
  
  // State for search and filters
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [termFilter, setTermFilter] = useState('All Terms');
  const [displayCourses, setDisplayCourses] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('Spring 2025');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
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
  
  // Get all courses
  const allCourses = useMemo(() => getAllCourses(), [getAllCourses]);
  
  // Department mappings for search - IMPORTANT for correct searching
  const departmentMappings = {
    // Math related
    'math': 'MTH',
    'mathematics': 'MTH',
    'mth': 'MTH',
    'stats': 'ST',
    'stat': 'ST',
    'statistics': 'ST',
    
    // Sciences
    'biology': 'BI',
    'bio': 'BI',
    'chemistry': 'CH',
    'chem': 'CH',
    'physics': 'PH',
    'biochemistry': 'BB',
    'biochem': 'BB',
    'environmental': 'ENSC',
    'env': 'ENSC',
    'microbiology': 'MB',
    'micro': 'MB',
    'zoology': 'Z',
    'zoo': 'Z',
    
    // Social Sciences
    'psychology': 'PSY',
    'psych': 'PSY',
    'psy': 'PSY',
    'sociology': 'SOC',
    'soc': 'SOC',
    'anthropology': 'ANTH',
    'anth': 'ANTH',
    'political': 'PS',
    'political science': 'PS',
    'polisci': 'PS',
    'politics': 'PS',
    'history': 'HST',
    'hist': 'HST',
    
    // Languages and Communication
    'writing': 'WR',
    'english': 'ENG',
    'eng': 'ENG',
    'communication': 'COMM',
    'comm': 'COMM',
    'spanish': 'SPAN',
    
    // Human Development and Family Sciences
    'human development': 'HDFS',
    'family': 'HDFS',
    'hdfs': 'HDFS',
    'family science': 'HDFS',
    'human services': 'HDFS',
    
    // Computer Science and Engineering
    'computer': 'CS',
    'cs': 'CS',
    'computer science': 'CS',
    'programming': 'CS',
    'software': 'CS',
    'engineering': 'ENGR',
    'engr': 'ENGR',
    
    // Business and Economics
    'econ': 'ECON',
    'economics': 'ECON',
    'business': 'BA',
    'accounting': 'BA',
    'finance': 'BA',
    'marketing': 'MRKT',
    'management': 'MGMT',
    
    // Arts
    'art': 'ART',
    'design': 'DSGN',
    'graphic': 'GD',
    'graphic design': 'GD',
    
    // Other common departments
    'philosophy': 'PHL',
    'geography': 'GEOG',
    'kinesiology': 'KIN',
    'kin': 'KIN',
    'education': 'ED',
    'nutrition': 'NUTR',
    'outdoor': 'OP',
    'tourism': 'TRAL',
    'recreation': 'TRAL'
  };
  
  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(['All Categories']);
    
    allCourses.forEach(course => {
      // Add department
      if (course.course_code) {
        const dept = course.course_code.split(' ')[0];
        if (dept) uniqueCategories.add(dept);
      }
      
      // Add category
      if (course.category) {
        uniqueCategories.add(course.category);
      }
      
      // Add requirement categories
      if (course.requirement_categories && course.requirement_categories.length > 0) {
        course.requirement_categories.forEach(cat => uniqueCategories.add(cat));
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }, [allCourses]);
  
  // Get unique terms
  const terms = ['All Terms', 'Fall', 'Winter', 'Spring'];
  
  // Initialize courses on component mount - but don't show all of them initially
  useEffect(() => {
    // Don't show all courses initially, just set the data available
    setDisplayCourses([]);
  }, [allCourses]);
  
  // Handle search button click
  const handleSearch = () => {
    setSearchPerformed(true);
    
    if (!searchInput.trim() && categoryFilter === 'All Categories' && termFilter === 'All Terms') {
      // If no search criteria, show just a limited set of courses
      const limitedCourses = [...allCourses]
        .sort((a, b) => a.course_code.localeCompare(b.course_code))
        .slice(0, 20); // Show only first 20 courses
      
      setDisplayCourses(limitedCourses);
      return;
    }
    
    // Start with all courses
    let filtered = [...allCourses];
    
    // Apply search term if present
    if (searchInput.trim()) {
      const search = searchInput.toLowerCase().trim();
      
      // Check for numeric search (course number)
      const isNumericSearch = /^\d+$/.test(search);
      
      // Check if search is for a specific department (direct or via mapping)
      const mappedDept = departmentMappings[search];
      
      if (mappedDept) {
        // Special handling for department searches - strict matching
        filtered = filtered.filter(course => {
          if (!course.course_code) return false;
          const dept = course.course_code.split(' ')[0];
          return dept === mappedDept;
        });
      } else if (isNumericSearch) {
        // Search for course number
        filtered = filtered.filter(course => 
          course.course_code && course.course_code.includes(search)
        );
      } else {
        // General search in multiple fields
        filtered = filtered.filter(course => 
          (course.course_code && course.course_code.toLowerCase().includes(search)) || 
          (course.title && course.title.toLowerCase().includes(search)) ||
          (course.description && course.description.toLowerCase().includes(search)) ||
          (course.instructor && course.instructor.toLowerCase().includes(search))
        );
      }
    }
    
    // Apply category filter if selected
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(course => {
        // Check if department matches
        const dept = course.course_code ? course.course_code.split(' ')[0] : '';
        if (dept === categoryFilter) return true;
        
        // Check category
        if (course.category === categoryFilter) return true;
        
        // Check requirement categories
        if (course.requirement_categories && course.requirement_categories.includes(categoryFilter)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Apply term filter if selected
    if (termFilter !== 'All Terms') {
      filtered = filtered.filter(course => {
        if (!course.terms_offered) return false;
        
        // Handle both array and string formats for terms_offered
        const terms = Array.isArray(course.terms_offered) 
          ? course.terms_offered 
          : [course.terms_offered];
          
        return terms.some(term => term && term.includes(termFilter));
      });
    }
    
    // Sort results by department priority
    filtered.sort((a, b) => {
      const aCode = a.course_code || '';
      const bCode = b.course_code || '';
      
      // Explicitly prevent HDFS 461 from being at the top
      if (aCode === 'HDFS 461') return 1;
      if (bCode === 'HDFS 461') return -1;
      
      // Get department from search input if it's a department search
      const searchDept = departmentMappings[searchInput.toLowerCase().trim()];
      
      // Prioritize exact matches for department searches
      if (searchDept) {
        const aDept = aCode.split(' ')[0];
        const bDept = bCode.split(' ')[0];
        
        if (aDept === searchDept && bDept !== searchDept) return -1;
        if (bDept === searchDept && aDept !== searchDept) return 1;
      }
      
      // Sort alphabetically by course code
      return aCode.localeCompare(bCode);
    });
    
    // Update display courses
    setDisplayCourses(filtered);
  };
  
  // Handle apply filters button click
  const handleApplyFilters = () => {
    handleSearch();
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setCategoryFilter('All Categories');
    setTermFilter('All Terms');
    setSearchPerformed(false);
    setDisplayCourses([]);
  };
  
  // Handle Enter key in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Course Search</h2>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Courses</label>
            <div className="flex">
              <input
                type="text"
                id="search"
                className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-primary focus:border-primary"
                placeholder="Enter course code, department, title, or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-white font-medium rounded-r-md hover:bg-primary-dark"
              >
                Search
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              id="category"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Filter by Term</label>
            <select
              id="term"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
            >
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
            >
              Apply Filters
            </button>
            
            {(searchInput.trim() || categoryFilter !== 'All Categories' || termFilter !== 'All Terms' || searchPerformed) && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {displayCourses.length > 0 ? (
              `Showing ${displayCourses.length} ${displayCourses.length === 1 ? 'course' : 'courses'}`
            ) : (
              searchPerformed ? 
                "No courses found. Try different search terms." : 
                "Enter search criteria and click 'Search' to find courses"
            )}
          </div>
        </div>
      </div>
      
      {/* Initial state message */}
      {!searchPerformed && displayCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-2">Enter search terms to find courses.</p>
          <p className="text-sm text-gray-600">Search by department name, course code, or keywords.</p>
        </div>
      )}
      
      {/* Course list */}
      {displayCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCourses.map(course => {
            const isCompleted = completedCourses.includes(course.course_code);
            const isPlanned = Object.values(plannedCourses).flat().includes(course.course_code);
            const prereqsMet = arePrerequisitesMet(course.course_code);
            
            return (
              <CourseCard
                key={course.course_code}
                course={course}
                isCompleted={isCompleted}
                isPlanned={isPlanned}
                prereqsMet={prereqsMet}
                onMarkCompleted={() => markCourseCompleted(course.course_code)}
                onUnmarkCompleted={() => unmarkCourseCompleted(course.course_code)}
                onAddToPlan={() => addCourseToPlan(course.course_code, selectedTerm)}
                plannableTerms={futurePlannableTerms}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
                termOfferings={termOfferings}
                showDetailsButton={true}
                showMarkCompletedButton={true}
              />
            );
          })}
        </div>
      )}
      
      {/* No results message */}
      {searchPerformed && displayCourses.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-2">No courses match your search criteria.</p>
          <p className="text-sm text-gray-600 mb-4">Try different search terms or filters.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseSearch;