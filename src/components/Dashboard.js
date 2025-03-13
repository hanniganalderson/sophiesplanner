import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePlannerContext } from '../context/PlannerContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
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
  
  // Current term
  const currentTerm = "Winter 2025";
  
  // Get current term courses with details
  const currentTermCourses = useMemo(() => {
    const termCourses = plannedCourses["Winter 2025"] || [];
    return termCourses.map(courseCode => {
      return courses.find(c => c.course_code === courseCode);
    }).filter(Boolean);
  }, [plannedCourses, courses]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8 transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn">
        Welcome to Your Psychology Degree Planner
      </h1>
      
      {/* Sylvia Plath Quote */}
      <div className="bg-secondary p-6 rounded-lg mb-8 border-l-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeIn" style={{ animationDelay: '100ms' }}>
        <p className="text-gray-700 italic">
          "Perhaps when we find ourselves wanting everything, it is because we are dangerously close to wanting nothing."
        </p>
        <p className="text-right text-sm text-primary mt-2">— Sylvia Plath</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Degree Progress Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-primary mb-4">Degree Progress</h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-48 h-48">
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
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-semibold text-primary">{progress.completedPercentage}%</p>
              <p className="text-xs text-gray-500">{progress.completed} credits</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Planned</p>
              <p className="text-xl font-semibold text-primary-light">{progress.plannedPercentage}%</p>
              <p className="text-xs text-gray-500">{progress.planned} credits</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-xl font-semibold text-gray-400">{progress.remainingPercentage}%</p>
              <p className="text-xs text-gray-500">{progress.remaining} credits</p>
            </div>
          </div>
          
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-medium text-primary">Current Term: {currentTerm}</p>
            <p className="text-sm text-gray-600 mt-1">Graduation Target: June 2028</p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Links</h2>
          
          <div className="space-y-3">
            <Link 
              to="/planner" 
              className="block p-3 bg-secondary rounded-md hover:bg-primary hover:text-white transition-all duration-300"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Term Planner</span>
              </div>
            </Link>
            
            <Link 
              to="/search" 
              className="block p-3 bg-secondary rounded-md hover:bg-primary hover:text-white transition-all duration-300"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Course Search</span>
              </div>
            </Link>
            
            <Link 
              to="/progress" 
              className="block p-3 bg-secondary rounded-md hover:bg-primary hover:text-white transition-all duration-300"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Degree Progress</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Current Term Courses */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-t-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeInUp" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold text-primary mb-4">Your {currentTerm} Courses</h2>
        
        {currentTermCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTermCourses.map((course, index) => (
              <div 
                key={course.course_code} 
                className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${500 + (index * 100)}ms` }}
              >
                <p className="font-mono text-xs text-gray-500">{course.course_code}</p>
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-gray-600 mt-1">{course.credits} credits</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-secondary rounded-lg">
            <p className="text-gray-600">No courses planned for {currentTerm}</p>
            <Link to="/planner" className="mt-2 inline-block text-primary hover:text-primary-dark font-medium transition-all duration-300 hover:translate-x-1">
              Add courses to your plan →
            </Link>
          </div>
        )}
      </div>
      
      {/* Internships & Extracurriculars */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-t-4 border-primary transition-all duration-300 hover:shadow-lg animate-fadeInUp" style={{ animationDelay: '600ms' }}>
        <h2 className="text-xl font-semibold text-primary mb-4">Psychology Opportunities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Internships */}
          <div>
            <h3 className="text-lg font-medium text-primary-dark mb-3">Recommended Internships</h3>
            <ul className="space-y-3">
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '700ms' }}>
                <p className="font-medium">University Counseling Center</p>
                <p className="text-sm text-gray-600">Gain practical experience in a clinical setting</p>
                <p className="text-xs text-primary mt-1">Apply in Fall for Spring positions</p>
              </li>
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '800ms' }}>
                <p className="font-medium">Child Development Research Lab</p>
                <p className="text-sm text-gray-600">Work with faculty on developmental psychology research</p>
                <p className="text-xs text-primary mt-1">Applications open year-round</p>
              </li>
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '900ms' }}>
                <p className="font-medium">Community Mental Health Center</p>
                <p className="text-sm text-gray-600">Support mental health services in the community</p>
                <p className="text-xs text-primary mt-1">Summer internship applications due in March</p>
              </li>
            </ul>
          </div>
          
          {/* Extracurriculars */}
          <div>
            <h3 className="text-lg font-medium text-primary-dark mb-3">Recommended Extracurriculars</h3>
            <ul className="space-y-3">
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '700ms' }}>
                <p className="font-medium">Psychology Student Association</p>
                <p className="text-sm text-gray-600">Network with peers and attend guest lectures</p>
                <p className="text-xs text-primary mt-1">Meetings every Tuesday at 5pm</p>
              </li>
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '800ms' }}>
                <p className="font-medium">Psi Chi Honor Society</p>
                <p className="text-sm text-gray-600">Join the international psychology honor society</p>
                <p className="text-xs text-primary mt-1">Applications due in October</p>
              </li>
              <li className="p-3 border rounded-md hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fadeIn" style={{ animationDelay: '900ms' }}>
                <p className="font-medium">Peer Mentoring Program</p>
                <p className="text-sm text-gray-600">Help new psychology students navigate their first year</p>
                <p className="text-xs text-primary mt-1">Training begins in September</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="https://www.apa.org/education/undergrad/research-opportunities" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark font-medium transition-all duration-300 hover:translate-x-1 inline-block"
          >
            Explore more opportunities at APA.org →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 