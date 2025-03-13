import React, { useState, useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import CourseCard from './CourseCard';
import { calculateGraduationDate } from '../utils/helpers';

const WhatIfScenario = () => {
  const { 
    courses, 
    completedCourses, 
    plannedCourses,
    degreeRequirements,
    calculateCredits,
    arePrerequisitesMet
  } = usePlannerContext();
  
  // Create a copy of completed courses for simulation
  const [simulatedCompleted, setSimulatedCompleted] = useState([...completedCourses]);
  const [selectedDegree, setSelectedDegree] = useState('psychology_bs');
  
  // Calculate progress with simulated completed courses
  const progress = useMemo(() => {
    const degreeData = degreeRequirements[selectedDegree];
    const totalCredits = degreeData.total_credits;
    const completedCreditsTotal = calculateCredits(simulatedCompleted);
    const percentage = Math.min(100, (completedCreditsTotal / totalCredits) * 100);
    
    return {
      completedCredits: completedCreditsTotal,
      totalCredits,
      percentage
    };
  }, [degreeRequirements, simulatedCompleted, calculateCredits, selectedDegree]);
  
  // Get courses that could be completed
  const potentialCourses = useMemo(() => {
    return courses.filter(course => {
      // Exclude already completed courses
      if (simulatedCompleted.includes(course.course_code)) {
        return false;
      }
      
      // Check if prerequisites would be met with simulated completed courses
      const prereqsMet = !course.prerequisites || course.prerequisites.every(prereq => 
        simulatedCompleted.includes(prereq)
      );
      
      return prereqsMet;
    });
  }, [courses, simulatedCompleted]);
  
  // Toggle a course as completed in the simulation
  const toggleCourseCompletion = (courseCode) => {
    if (simulatedCompleted.includes(courseCode)) {
      setSimulatedCompleted(prev => prev.filter(code => code !== courseCode));
    } else {
      setSimulatedCompleted(prev => [...prev, courseCode]);
    }
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setSimulatedCompleted([...completedCourses]);
  };
  
  // Calculate new graduation date based on simulation
  const simulatedGraduationDate = useMemo(() => {
    // Create a copy of planned courses and remove simulated completed courses
    const updatedPlannedCourses = {};
    
    Object.entries(plannedCourses).forEach(([term, courses]) => {
      updatedPlannedCourses[term] = courses.filter(code => !simulatedCompleted.includes(code));
    });
    
    return calculateGraduationDate(updatedPlannedCourses);
  }, [plannedCourses, simulatedCompleted]);
  
  // Calculate credits needed to graduate
  const creditsToGraduate = Math.max(0, progress.totalCredits - progress.completedCredits);
  
  return (
    <div className="what-if-scenario">
      <div className="what-if-header">
        <h2 className="what-if-title">What-If Scenario Planner</h2>
        <p className="what-if-description">
          Simulate completing additional courses to see how it affects your degree progress and graduation timeline.
        </p>
      </div>
      
      <div className="what-if-controls">
        <button 
          className="btn btn-secondary"
          onClick={resetSimulation}
        >
          Reset Simulation
        </button>
      </div>
      
      <div className="what-if-grid">
        <div className="what-if-card progress-card">
          <h3 className="card-title">Simulated Progress</h3>
          
          <div className="progress-stats">
            <div className="progress-stat">
              <span className="progress-label">Credits Completed:</span>
              <span className="progress-value">{progress.completedCredits} / {progress.totalCredits}</span>
            </div>
            
            <div className="progress-stat">
              <span className="progress-label">Progress:</span>
              <span className="progress-value">{progress.percentage.toFixed(1)}%</span>
            </div>
            
            <div className="progress-stat">
              <span className="progress-label">Credits to Graduate:</span>
              <span className="progress-value">{creditsToGraduate}</span>
            </div>
            
            {simulatedGraduationDate && (
              <div className="progress-stat">
                <span className="progress-label">Projected Graduation:</span>
                <span className="progress-value">{simulatedGraduationDate}</span>
              </div>
            )}
          </div>
          
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill progress-bar-fill-primary"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{progress.percentage.toFixed(1)}%</div>
          </div>
          
          <div className="simulation-comparison">
            <h4>Comparison to Current Plan</h4>
            <div className="comparison-item">
              <span className="comparison-label">Additional Credits:</span>
              <span className="comparison-value">
                {progress.completedCredits - calculateCredits(completedCourses)}
              </span>
            </div>
            <div className="comparison-item">
              <span className="comparison-label">Additional Courses:</span>
              <span className="comparison-value">
                {simulatedCompleted.length - completedCourses.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="what-if-card courses-card">
          <h3 className="card-title">Courses to Simulate</h3>
          <p className="card-description">
            Select courses to add to your simulation. Only courses with met prerequisites are shown.
          </p>
          
          <div className="potential-courses-list">
            {potentialCourses.length > 0 ? (
              potentialCourses.map(course => (
                <div 
                  key={course.course_code} 
                  className={`potential-course ${simulatedCompleted.includes(course.course_code) ? 'selected' : ''}`}
                  onClick={() => toggleCourseCompletion(course.course_code)}
                >
                  <div className="course-header">
                    <span className="course-code">{course.course_code}</span>
                    <span className="course-credits">{course.credits} credits</span>
                  </div>
                  <div className="course-title">{course.title}</div>
                  <div className="course-checkbox">
                    <input 
                      type="checkbox" 
                      checked={simulatedCompleted.includes(course.course_code)}
                      onChange={() => {}} // Handled by the onClick on the parent div
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-courses">No additional courses available with current prerequisites.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfScenario; 