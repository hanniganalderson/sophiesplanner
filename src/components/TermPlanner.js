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
  const [showMinorInfo, setShowMinorInfo] = useState(false);
  const [selectedMinor, setSelectedMinor] = useState('hdfs'); // 'hdfs' or 'ecde'
  
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
    
    // Use our special function to get terms for this course
    const courseTerms = getTermsForCourse(course.course_code);
    if (!courseTerms.includes(selectedSeason)) {
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
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Term Planner</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Term selection sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Select a Term</h3>
            
            <div className="space-y-2">
              {terms.map((term, index) => {
                const termCourses = plannedCourses[term] || [];
                const termCredits = calculateCredits(termCourses);
                
                return (
                  <div 
                    key={term}
                    className={`p-3 rounded-md cursor-pointer transition-all duration-300 ${
                      selectedTerm === term 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    } ${animateTerms ? 'animate-fadeInRight' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleTermSelect(term)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{term}</span>
                      <span className="text-sm">
                        {termCourses.length} {termCourses.length === 1 ? 'course' : 'courses'}
                      </span>
                    </div>
                    
                    {termCourses.length > 0 && (
                      <div className="mt-1 text-xs">
                        {termCredits} {termCredits === 1 ? 'credit' : 'credits'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Minor Information Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowMinorInfo(!showMinorInfo)}
                className="w-full px-4 py-3 text-base font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
              >
                {showMinorInfo ? 'Hide Minor Options' : 'Show HDFS Minor Options'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          {/* Minor Information Panel */}
          {showMinorInfo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">HDFS Minor Options</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMinor('hdfs')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedMinor === 'hdfs' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    HDFS Minor
                  </button>
                  <button
                    onClick={() => setSelectedMinor('ecde')}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedMinor === 'ecde' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Early Childhood Minor
                  </button>
                </div>
              </div>
              
              {selectedMinor === 'hdfs' ? (
                <div className="animate-fadeIn">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Human Development & Family Sciences Minor (28-31 credits)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Students minoring in Human Development and Family Sciences will learn how people change across the life
                    course within the contexts of families, schools, and communities. This minor complements other academic degrees
                    such as education, liberal studies, psychology, social science and allied health sciences.
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Required Core (19 Credits):</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>HDFS 201 - Contemporary Families in US (3)</li>
                      <li>HDFS 311 - Infant & Child Development (4)</li>
                      <li>HDFS 313 - Adolescent Development (4)</li>
                      <li>HDFS 314 - Adult Development & Aging (4)</li>
                      <li>HDFS 341 - Family Studies (4)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Electives (9-12 Credits) - Select 3 of the following:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>HDFS 240 - Human Sexuality (3)</li>
                      <li>HDFS 262 - Intro. to Human Services (3)</li>
                      <li>HDFS 360 - Critical Thinking in HDFS (4)</li>
                      <li>HDFS 312 - Parenting Research & Application (4)</li>
                      <li>HDFS 431 - Family, School & Community (3)</li>
                      <li>HDFS 432 - Children/Youth with Disabilities (3)</li>
                      <li>HDFS 444 - Family Violence & Neglect (4)</li>
                      <li>HDFS 447 - Families & Poverty (4)</li>
                      <li>HDFS 460 - Family Policy (4)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Early Childhood Development and Education Minor (32 credits)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This minor focuses on early childhood development and education, providing a foundation for working with young children.
                  </p>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-700 mb-2">Required Core (26 Credits):</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>PSY 201 - General Psychology (4)</li>
                      <li>PSY 202 - General Psychology (4)</li>
                      <li>HDFS 311 - Infant & Child Development (4)</li>
                      <li>HDFS 330 - Fostering Learning in Early Childhood (4)</li>
                      <li>HDFS 331 - Directed Experience in EC (3)</li>
                      <li>HDFS 341 - Family Studies (4)</li>
                      <li>HDFS 431 - Family, School & Community (3)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Upper Division Electives (6 Credits) - Select from:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>HDFS 312 - Parenting Research & Application (4)</li>
                      <li>HDFS 432 - Children With Special Needs (3)</li>
                      <li>HDFS 444 - Family Violence & Neglect (4)</li>
                      <li>HDFS 447 - Families & Poverty (4)</li>
                      <li>HDFS 460 - Family Policy (4)</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">Minor Eligibility Requirements:</h5>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Maintain a 2.0 or better OSU GPA</li>
                  <li>All courses must be taken for a letter (A-F) grade</li>
                  <li>No more than two attempts at any major course or pre-requisite course</li>
                  <li>Minor is available to all majors, except those majoring in Human Development & Family Sciences</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{selectedTerm}</h3>
              
              <button
                onClick={() => setShowCatalog(!showCatalog)}
                className="px-3 py-1 text-sm rounded bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {showCatalog ? 'Hide Catalog' : 'Show Catalog'}
              </button>
            </div>
            
            {/* Planned courses for this term */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Planned Courses</h4>
              
              {(plannedCourses[selectedTerm]?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {plannedCourses[selectedTerm].map(courseCode => {
                    const course = courses.find(c => c.course_code === courseCode);
                    if (!course) return null;
                    
                    return (
                      <div key={courseCode} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <h5 className="font-medium text-gray-800">{course.course_code}</h5>
                          <p className="text-sm text-gray-600">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.credits} credits</p>
                        </div>
                        
                        <button
                          onClick={() => removeCourseFromPlan(courseCode, selectedTerm)}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Credits:</span>
                      <span>{calculateCredits(plannedCourses[selectedTerm] || [])}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No courses planned for this term yet.</p>
              )}
            </div>
            
            {/* Course catalog */}
            {showCatalog && (
              <div className="mt-8 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-700">Available Courses</h4>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={catalogFilter}
                      onChange={(e) => setCatalogFilter(e.target.value)}
                      className="pl-3 pr-10 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {catalogFilter && (
                      <button
                        onClick={() => setCatalogFilter('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                
                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCourses.map(course => {
                      const prereqsMet = arePrerequisitesMet(course.course_code);
                      // Get terms for this course using our special function
                      const courseTerms = getTermsForCourse(course.course_code);
                      
                      return (
                        <div key={course.course_code} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-800">{course.course_code}</h3>
                              <p className="text-sm text-gray-700">{course.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{course.credits} credits</p>
                              
                              {/* Display all terms the course is offered in */}
                              <p className="text-xs text-gray-500 mt-1">
                                Available: {courseTerms.join(', ')}
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
                            <div className="mt-2">
                              <p className="text-xs text-red-600">Prerequisites not met</p>
                              <ul className="text-xs text-red-500 list-disc list-inside mt-1">
                                {getMissingPrerequisites(course.course_code).map((prereq, index) => (
                                  <li key={index}>{prereq}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No courses match your search criteria.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermPlanner;