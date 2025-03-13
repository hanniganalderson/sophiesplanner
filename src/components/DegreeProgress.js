// src/components/DegreeProgress.js
import React, { useMemo } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DegreeProgress = () => {
  const { 
    degreeRequirements, 
    completedCourses, 
    plannedCourses,
    calculateCredits,
    courses
  } = usePlannerContext();
  
  // Calculate degree progress
  const progress = useMemo(() => {
    const totalCredits = 180; // Fixed total credits
    const completedCreditsTotal = calculateCredits(completedCourses);
    
    // Calculate planned credits (excluding completed courses)
    let plannedCreditsTotal = 0;
    Object.values(plannedCourses).forEach(termCourses => {
      termCourses.forEach(courseCode => {
        if (!completedCourses.includes(courseCode)) {
          plannedCreditsTotal += calculateCredits([courseCode]);
        }
      });
    });
    
    const remainingCredits = totalCredits - completedCreditsTotal - plannedCreditsTotal;
    
    return {
      total: totalCredits,
      completed: completedCreditsTotal,
      planned: plannedCreditsTotal,
      remaining: remainingCredits,
      completedPercentage: Math.round((completedCreditsTotal / totalCredits) * 100),
      plannedPercentage: Math.round((plannedCreditsTotal / totalCredits) * 100),
      remainingPercentage: Math.round((remainingCredits / totalCredits) * 100)
    };
  }, [degreeRequirements, completedCourses, plannedCourses, calculateCredits]);
  
  // Data for pie chart
  const chartData = [
    { name: 'Completed', value: progress.completed, color: '#7B3FF2' },
    { name: 'Planned', value: progress.planned, color: '#A67FF8' },
    { name: 'Remaining', value: progress.remaining, color: '#F5F0FF' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-primary mb-4">Degree Progress</h2>
      
      <div className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-64 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full md:w-1/2 mt-6 md:mt-0 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-3 border rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Completed</span>
                <span className="progress-completed">{progress.completedPercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${progress.completedPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-right text-gray-600">
                {progress.completed} / {progress.total} credits
              </div>
            </div>
            
            <div className="p-3 border rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Planned</span>
                <span className="progress-planned">{progress.plannedPercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-light" 
                  style={{ width: `${progress.plannedPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-right text-gray-600">
                {progress.planned} / {progress.total} credits
              </div>
            </div>
            
            <div className="p-3 border rounded-md bg-white shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Remaining</span>
                <span className="progress-remaining">{progress.remainingPercentage}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-300" 
                  style={{ width: `${progress.remainingPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-right text-gray-600">
                {progress.remaining} / {progress.total} credits
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DegreeProgress;