// src/components/TermPlanner.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const TermPlanner = () => {
  const { 
    plannedCourses, 
    addCourseToPlan, 
    removeCourseFromPlan,
    courses,
    calculateCredits,
    arePrerequisitesMet,
    completedCourses,
    externalCourses,
    getAllCourses
  } = usePlannerContext();
  
  // State for course catalog
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Spring 2025');
  const [animateTerms, setAnimateTerms] = useState(false);
  const [showMinorInfo, setShowMinorInfo] = useState(false);
  const [selectedMinor, setSelectedMinor] = useState('hdfs'); // 'hdfs' or 'ecde'
  
  // Define priority departments
  const priorityDepts = useMemo(() => ['PSY', 'HDFS'], []);
  
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
  ];
  
  // Get terms for a course
  const getTermsForCourse = useCallback((courseCode) => {
    // First check if it's in our manual list
    const multiTermCourses = {
      'PSY 202Z': ['Fall', 'Spring'],
      // Add more courses as needed
    };
    
    if (multiTermCourses[courseCode]) {
      return terms.filter(term => {
        const season = term.split(' ')[0];
        return multiTermCourses[courseCode].includes(season);
      });
    }
    
    // Check core courses
    const course = courses.find(c => c.course_code === courseCode);
    if (course && course.terms_offered && course.terms_offered.length > 0) {
      return course.terms_offered;
    }
    
    // Check external courses
    const externalCourse = externalCourses.find(c => c.course_code === courseCode);
    if (externalCourse) {
      if (!externalCourse.terms_offered || externalCourse.terms_offered.length === 0) {
        return ['Fall', 'Winter', 'Spring'];
      }
      return Array.isArray(externalCourse.terms_offered) ? externalCourse.terms_offered : 
             (externalCourse.terms_offered ? [externalCourse.terms_offered] : []);
    }
    
    return [];
  }, [courses, externalCourses, terms]);
  
  // Get missing prerequisites for a course
  const getMissingPrerequisites = useCallback((courseCode) => {
    // First check core courses
    const course = courses.find(c => c.course_code === courseCode);
    
    // If not found in core courses, check external courses
    if (!course) {
      const externalCourse = externalCourses.find(c => c.course_code === courseCode);
      if (!externalCourse || !externalCourse.prerequisites || externalCourse.prerequisites.length === 0) {
        return [];
      }
    
      // If external course has prerequisites, process them
      const missing = [];
      externalCourse.prerequisites.forEach(prereq => {
        if (prereq.includes(' or ')) {
          const options = prereq.split(' or ');
          const anyMet = options.some(option => 
            completedCourses.some(c => c.course_code === option.trim())
          );
          if (!anyMet) {
            missing.push(prereq);
          }
        } else if (!completedCourses.some(c => c.course_code === prereq)) {
          missing.push(prereq);
        }
      });
      
      return missing;
    }
    
    // Original logic for core courses
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return [];
    }
    
    const missing = [];
    
    course.prerequisites.forEach(prereq => {
      if (prereq.includes(' or ')) {
        const options = prereq.split(' or ');
        const anyMet = options.some(option => 
          completedCourses.some(c => c.course_code === option.trim())
        );
        if (!anyMet) {
          missing.push(prereq);
        }
      } else if (!completedCourses.some(c => c.course_code === prereq)) {
        missing.push(prereq);
      }
    });
    
    return missing;
  }, [courses, externalCourses, completedCourses]);
  
  // Handle term selection
  const handleTermSelect = useCallback((term) => {
    setSelectedTerm(term);
  }, []);
  
  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    const allCourses = getAllCourses();
    
    if (!catalogFilter) {
      return allCourses;
    }
    
    const filter = catalogFilter.toLowerCase();
    return allCourses.filter(course => 
      course.course_code.toLowerCase().includes(filter) || 
      course.title.toLowerCase().includes(filter) ||
      (course.tags && course.tags.some(tag => tag.toLowerCase().includes(filter))) ||
      (course.alternative_names && course.alternative_names.some(name => name.toLowerCase().includes(filter)))
    );
  }, [catalogFilter, getAllCourses]);
  
  // Group courses by department
  const groupedCourses = useMemo(() => {
    const grouped = {};
    
    filteredCourses.forEach(course => {
      const dept = course.course_code.split(' ')[0];
      if (!grouped[dept]) {
        grouped[dept] = [];
      }
      grouped[dept].push(course);
    });
    
    return grouped;
  }, [filteredCourses]);
  
  // Sort departments with PSY and HDFS first
  const sortedDepts = useMemo(() => {
    const depts = Object.keys(groupedCourses);
    
    return depts.sort((a, b) => {
      if (priorityDepts.includes(a) && !priorityDepts.includes(b)) {
        return -1;
      }
      if (!priorityDepts.includes(a) && priorityDepts.includes(b)) {
        return 1;
      }
      return a.localeCompare(b);
    });
  }, [groupedCourses, priorityDepts]);
  
  return (
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Term Planner</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Terms</h3>
            
            <div className="space-y-2">
              {terms.map((term, index) => (
                <button
                  key={term}
                  onClick={() => handleTermSelect(term)}
                  className={`w-full text-left px-4 py-2 rounded transition-all ${
                    selectedTerm === term
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${animateTerms ? 'animate-fadeIn' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {term}
                  {plannedCourses[term] && plannedCourses[term].length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-primary">
                      {plannedCourses[term].length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Minor Information Button - Improved styling for better readability */}
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
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Minor Information Panel */}
          {showMinorInfo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">HDFS Minor Options</h3>
              
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setSelectedMinor('hdfs')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedMinor === 'hdfs'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Human Development & Family Sciences
                </button>
                
                <button
                  onClick={() => setSelectedMinor('ecde')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedMinor === 'ecde'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Early Childhood Development
                </button>
              </div>
              
              {selectedMinor === 'hdfs' ? (
                <div className="animate-fadeIn">
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Human Development & Family Sciences Minor (28-31 credits)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    This minor complements psychology by focusing on how people change across the life course within the contexts of families, schools, and communities.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Required Core (19 Credits):</h5>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">1</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 201</span>
                            <p className="text-sm text-gray-600">Contemporary Families in US (3)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">2</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 311</span>
                            <p className="text-sm text-gray-600">Infant & Child Development (4)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">3</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 313</span>
                            <p className="text-sm text-gray-600">Adolescent Development (4)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">4</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 314</span>
                            <p className="text-sm text-gray-600">Adult Development & Aging (4)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs mr-2 mt-0.5">5</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 341</span>
                            <p className="text-sm text-gray-600">Family Studies (4)</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Electives (9-12 Credits) - Select 3:</h5>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 240</span>
                            <p className="text-sm text-gray-600">Human Sexuality (3)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 262</span>
                            <p className="text-sm text-gray-600">Intro. to Human Services (3)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 360</span>
                            <p className="text-sm text-gray-600">Critical Thinking in HDFS (4)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 312</span>
                            <p className="text-sm text-gray-600">Parenting Research & Appl. (4)</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-gray-700">HDFS 431</span>
                            <p className="text-sm text-gray-600">Family, School & Community (3)</p>
                          </div>
                        </li>
                      </ul>
                    </div>
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
                className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
              >
                {showCatalog ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Close Course Catalog
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Browse Course Catalog
                  </>
                )}
              </button>
            </div>
            
            {/* Planned courses for this term */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Planned Courses</h4>
              
              {plannedCourses[selectedTerm] && plannedCourses[selectedTerm].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plannedCourses[selectedTerm].map(course => (
                    <div key={course.course_code} className="p-3 border border-primary-light rounded-md hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800">{course.course_code}</h5>
                          <p className="text-sm text-gray-600">{course.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{course.credits} credits</p>
                        </div>
                        
                        <button
                          onClick={() => removeCourseFromPlan(course.course_code, selectedTerm)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove from plan"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No courses planned for this term yet.</p>
              )}
              
              {plannedCourses[selectedTerm] && plannedCourses[selectedTerm].length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    Total credits: <span className="font-medium">{calculateCredits(plannedCourses[selectedTerm])}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Course catalog */}
            {showCatalog && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md animate-fadeIn">
                <div className="mb-4">
                  <label htmlFor="catalogFilter" className="block text-sm font-medium text-gray-700 mb-1">Search Courses</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="catalogFilter"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Search by course code, title, or keywords"
                      value={catalogFilter}
                      onChange={(e) => setCatalogFilter(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Display all courses, grouped by department with PSY and HDFS first */}
                <div className="mt-4">
                  {filteredCourses.length > 0 ? (
                    <div className="space-y-6">
                      {sortedDepts.map(dept => {
                        // Create a separate constant for the department's courses
                        const departmentCourses = groupedCourses[dept];
                        
                        // Sort courses by term availability for the selected term
                        const sortedCourses = [...departmentCourses].sort((a, b) => {
                          const aOfferedInTerm = getTermsForCourse(a.course_code).includes(selectedTerm);
                          const bOfferedInTerm = getTermsForCourse(b.course_code).includes(selectedTerm);
                          
                          // First prioritize courses offered in the selected term
                          if (aOfferedInTerm && !bOfferedInTerm) return -1;
                          if (!aOfferedInTerm && bOfferedInTerm) return 1;
                          
                          // Then sort by course code
                          return a.course_code.localeCompare(b.course_code);
                        });
                        
                        return (
                          <div key={dept} className="border-t pt-4 first:border-t-0 first:pt-0">
                            <h4 className="text-lg font-medium text-gray-700 mb-3">{dept} Courses</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {sortedCourses.map(course => {
                                const prereqsMet = arePrerequisitesMet(course.course_code);
                                const courseTerms = getTermsForCourse(course.course_code);
                                const isOfferedInSelectedTerm = courseTerms.includes(selectedTerm);
                                
                                return (
                                  <div 
                                    key={course.course_code} 
                                    className={`p-3 border rounded-md hover:bg-gray-50 ${
                                      isOfferedInSelectedTerm 
                                        ? 'border-primary-light' 
                                        : 'border-gray-200'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h5 className="font-medium text-gray-800">{course.course_code}</h5>
                                        <p className="text-sm text-gray-600">{course.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{course.credits} credits</p>
                                        
                                        {courseTerms.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {courseTerms.map(term => (
                                              <span 
                                                key={term} 
                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                  term === selectedTerm
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                              >
                                                {term}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-col items-end">
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
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No courses match your search criteria.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermPlanner;