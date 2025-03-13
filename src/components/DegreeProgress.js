// src/components/DegreeProgress.js
import React, { useState, useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import RequirementTracker from './RequirementTracker';

const DegreeProgress = () => {
  const { 
    degreeRequirements, 
    completedCourses, 
    plannedCourses,
    calculateCredits,
    courses
  } = usePlannerContext();
  
  const [selectedDegree, setSelectedDegree] = useState('psychology_bs');
  
  const degreeData = degreeRequirements[selectedDegree];
  
  // Calculate overall progress
  const progress = useMemo(() => {
    const totalCredits = 180; // Fixed total credits
    const completedCreditsTotal = calculateCredits(completedCourses);
    
    // Calculate credits from planned courses
    const plannedCreditsTotal = Object.values(plannedCourses)
      .flat()
      .filter(code => !completedCourses.includes(code)) // Avoid double-counting
      .reduce((total, code) => {
        const course = courses.find(c => c.course_code === code);
        return total + (course ? parseInt(course.credits) : 0);
      }, 0);
    
    const totalCompletedAndPlanned = completedCreditsTotal + plannedCreditsTotal;
    const percentage = Math.min(100, Math.round((completedCreditsTotal / totalCredits) * 100));
    const projectedPercentage = Math.min(100, Math.round((totalCompletedAndPlanned / totalCredits) * 100));
    
    return {
      completedCredits: completedCreditsTotal,
      plannedCredits: plannedCreditsTotal,
      totalCredits,
      percentage,
      projectedPercentage,
      totalCompletedAndPlanned,
      remainingCredits: totalCredits - completedCreditsTotal - plannedCreditsTotal
    };
  }, [degreeData, completedCourses, plannedCourses, calculateCredits, courses]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">Degree Progress</h1>
      <p className="text-gray-600 mb-6">
        Track your progress toward your Psychology degree. Current term: <span className="font-medium text-primary">Winter 2025</span>
      </p>
      
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-primary">
        <h2 className="text-xl font-semibold text-primary mb-4">Overall Progress</h2>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-4xl font-bold text-primary">{progress.percentage}%</p>
            <p className="text-gray-600">Completed ({progress.completedCredits} of 180 credits)</p>
            
            {progress.plannedCredits > 0 && (
              <p className="text-sm text-primary-light mt-1">
                +{progress.plannedCredits} credits planned
              </p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0 w-full md:w-2/3">
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            
            {progress.plannedCredits > 0 && (
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Current: {progress.percentage}%</span>
                <span className="text-xs text-primary-light">
                  Projected: {progress.projectedPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xl font-semibold text-primary">{progress.completedCredits}</p>
            <p className="text-sm text-gray-600">Credits Completed</p>
          </div>
          
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xl font-semibold text-primary-light">{progress.plannedCredits}</p>
            <p className="text-sm text-gray-600">Credits Planned</p>
          </div>
          
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xl font-semibold text-gray-500">{progress.remainingCredits}</p>
            <p className="text-sm text-gray-600">Credits Remaining</p>
          </div>
          
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xl font-semibold text-primary-dark">180</p>
            <p className="text-sm text-gray-600">Total Required</p>
          </div>
        </div>
      </div>
      
      {/* Requirement Categories */}
      <h2 className="text-xl font-semibold text-primary mb-4">Degree Requirements</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {degreeData && degreeData.categories && Object.entries(degreeData.categories).map(([key, category]) => (
          <RequirementTracker
            key={key}
            category={category}
            completedCourses={completedCourses}
            plannedCourses={plannedCourses}
            courses={courses}
          />
        ))}
      </div>
    </div>
  );
};

export default DegreeProgress;