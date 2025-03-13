import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePlannerContext } from '../context/PlannerContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Notes from './Notes';

const Dashboard = () => {
  const { 
    degreeRequirements, 
    completedCourses, 
    plannedCourses,
    calculateCredits,
    courses
  } = usePlannerContext();
  
  // Inspirational quotes with Sylvia Plath included
  const quotes = [
    { text: "Perhaps when we find ourselves wanting everything, it is because we are dangerously close to wanting nothing.", author: "Sylvia Plath" },
    { text: "The good life is a process, not a state of being.", author: "Carl Rogers" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
    { text: "The purpose of psychology is to give us a completely different idea of the things we know best.", author: "Paul Valéry" }
  ];
  
  // Psychology fun facts
  const funFacts = [
    "Sylvia Plath's novel 'The Bell Jar' is considered a seminal work on mental illness and is often studied in psychology courses.",
    "The human brain processes images 60,000 times faster than text.",
    "The average person has about 70,000 thoughts per day.",
    "Dreams are primarily visual, with little to no sound.",
    "The field of positive psychology was established by Martin Seligman in 1998.",
    "The left side of your brain controls the right side of your body, and vice versa."
  ];
  
  // Random quote and fun fact
  const [quote, setQuote] = useState(quotes[0]);
  const [funFact, setFunFact] = useState(funFacts[0]);
  
  // Set random quote and fun fact on mount
  useEffect(() => {
    const randomQuoteIndex = Math.floor(Math.random() * quotes.length);
    const randomFactIndex = Math.floor(Math.random() * funFacts.length);
    setQuote(quotes[randomQuoteIndex]);
    setFunFact(funFacts[randomFactIndex]);
  }, []);
  
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
  const currentTerm = "Spring 2025";
  
  // Get courses for current term
  const currentTermCourses = useMemo(() => {
    return (plannedCourses[currentTerm] || []).map(courseCode => 
      courses.find(c => c.course_code === courseCode)
    ).filter(Boolean);
  }, [plannedCourses, currentTerm, courses]);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Quote and Fun Fact */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-secondary animate-fadeIn">
        <p className="text-lg italic text-gray-700">"{quote.text}"</p>
        <p className="text-right text-sm text-gray-500 mt-2">— {quote.author}</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600"><span className="font-medium">Psychology Fun Fact:</span> {funFact}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Current term courses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary animate-fadeInUp">
            <h2 className="text-xl font-semibold text-primary mb-4">Spring 2025 Courses</h2>
            
            {currentTermCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No courses planned for Spring 2025</p>
                <Link 
                  to="/planner" 
                  className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Plan Your Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {currentTermCourses.map(course => (
                  <div key={course.course_code} className="p-4 border border-gray-200 rounded-md hover:shadow-sm transition-all duration-300">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-mono text-xs text-gray-600">{course.course_code}</p>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-gray-700">{course.credits} credits</p>
                        
                        {course.instructor && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Instructor:</span> {course.instructor}
                          </p>
                        )}
                        
                        {course.meeting_pattern && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Schedule:</span> {course.meeting_pattern}
                          </p>
                        )}
                      </div>
                      <Link 
                        to="/planner" 
                        className="text-xs text-primary hover:text-primary-dark"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes component */}
          <Notes />
          
          {/* Psychology Opportunities - Oregon-specific and PhD-focused */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-secondary animate-fadeInUp">
            <h2 className="text-xl font-semibold text-secondary mb-4">PhD Track Opportunities in Oregon</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Research Opportunities</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">Oregon State University Research Lab</h4>
                  <p className="text-sm text-gray-600">Work with faculty on research projects to build your PhD application</p>
                  <p className="text-xs text-gray-500 mt-1">Applications for summer research positions due in February</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">Center for Cognitive Neuroscience</h4>
                  <p className="text-sm text-gray-600">Gain experience with fMRI and other neuroscience techniques</p>
                  <p className="text-xs text-gray-500 mt-1">Contact Dr. Martinez by April for Fall positions</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">Oregon Health & Science University</h4>
                  <p className="text-sm text-gray-600">Clinical psychology research opportunities in Portland</p>
                  <p className="text-xs text-gray-500 mt-1">Competitive summer internship program - apply by January</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">PhD Preparation</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">GRE Preparation Workshop</h4>
                  <p className="text-sm text-gray-600">Free workshops offered by the Psychology Department</p>
                  <p className="text-xs text-gray-500 mt-1">Sessions begin in Fall for Spring test dates</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">Graduate School Application Seminar</h4>
                  <p className="text-sm text-gray-600">Learn how to craft competitive PhD applications</p>
                  <p className="text-xs text-gray-500 mt-1">Offered every Winter term on Thursdays at 4pm</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium">Faculty Mentorship Program</h4>
                  <p className="text-sm text-gray-600">Connect with faculty who can write strong recommendation letters</p>
                  <p className="text-xs text-gray-500 mt-1">Applications open in September</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-right">
              <a 
                href="https://www.apa.org/education/grad" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Explore PhD programs at APA.org →
              </a>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Degree progress */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary animate-fadeInUp">
            <h2 className="text-xl font-semibold text-primary mb-4">Degree Progress</h2>
            
            <div className="h-64 w-full">
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
            
            <div className="flex justify-between mt-4">
              <div className="text-center">
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-primary">{progress.completedPercentage}%</p>
                <p className="text-xs text-gray-500">{progress.completed} credits</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Planned</p>
                <p className="text-2xl font-bold text-secondary">{progress.plannedPercentage}%</p>
                <p className="text-xs text-gray-500">{progress.planned} credits</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium">Remaining</p>
                <p className="text-2xl font-bold text-gray-400">{progress.remainingPercentage}%</p>
                <p className="text-xs text-gray-500">{progress.remaining} credits</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                to="/requirements" 
                className="block w-full text-center py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors"
              >
                View Degree Requirements
              </Link>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-primary mb-4">Quick Links</h2>
            
            <div className="space-y-2">
              <Link 
                to="/planner" 
                className="block w-full text-left px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Term Planner
              </Link>
              
              <Link 
                to="/search" 
                className="block w-full text-left px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Course Search
              </Link>
              
              <Link 
                to="/completed" 
                className="block w-full text-left px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Completed Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 