import { useState } from 'react';
import { usePlannerContext } from '../context/PlannerContext';

const DegreePlanner = () => {
  const { 
    completedCourses, 
    plannedCourses, 
    degreeRequirements,
    calculateCredits
  } = usePlannerContext();
  
  const [showMinorInfo, setShowMinorInfo] = useState(false);
  const [selectedMinor, setSelectedMinor] = useState('hdfs'); // 'hdfs' or 'ecde'
  
  // Calculate total planned credits
  const totalPlannedCredits = calculateCredits(Object.values(plannedCourses).flat());
  
  // Calculate total completed credits
  const totalCompletedCredits = calculateCredits(completedCourses);
  
  // Calculate total credits (completed + planned)
  const totalCredits = totalCompletedCredits + totalPlannedCredits;
  
  // Calculate remaining credits needed
  const remainingCredits = Math.max(0, degreeRequirements.psychology_bs.total_credits - totalCredits);
  
  return (
    <div className="mt-8 animate-fadeIn">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Degree Planner</h2>
      
      {/* Degree Progress Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Psychology Degree Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Completed</h4>
            <p className="text-3xl font-bold text-primary">{totalCompletedCredits}</p>
            <p className="text-sm text-gray-600">credits</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Planned</h4>
            <p className="text-3xl font-bold text-secondary">{totalPlannedCredits}</p>
            <p className="text-sm text-gray-600">credits</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-lg font-medium text-gray-700 mb-2">Remaining</h4>
            <p className="text-3xl font-bold text-gray-800">{remainingCredits}</p>
            <p className="text-sm text-gray-600">credits needed</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress toward {degreeRequirements.psychology_bs.total_credits} credits</span>
            <span>{Math.round((totalCredits / degreeRequirements.psychology_bs.total_credits) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="flex rounded-full h-4">
              <div 
                className="bg-primary rounded-l-full" 
                style={{ width: `${(totalCompletedCredits / degreeRequirements.psychology_bs.total_credits) * 100}%` }}
              ></div>
              <div 
                className="bg-secondary" 
                style={{ width: `${(totalPlannedCredits / degreeRequirements.psychology_bs.total_credits) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex text-xs mt-1">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-primary rounded-full mr-1"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-secondary rounded-full mr-1"></div>
              <span>Planned</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Minor Options Button - Improved styling for better readability */}
      <div className="mb-6">
        <button
          onClick={() => setShowMinorInfo(!showMinorInfo)}
          className="w-full px-4 py-3 text-base font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
        >
          {showMinorInfo ? 'Hide Minor Options' : 'Show HDFS Minor Options'}
        </button>
      </div>
      
      {/* Minor Information Panel */}
      {showMinorInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 md:mb-0">HDFS Minor Options for Psychology Majors</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedMinor('hdfs')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedMinor === 'hdfs' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                HDFS Minor
              </button>
              <button
                onClick={() => setSelectedMinor('ecde')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  selectedMinor === 'ecde' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Early Childhood Minor
              </button>
            </div>
          </div>
          
          {selectedMinor === 'hdfs' ? (
            <div className="animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-800">Human Development & Family Sciences Minor</h4>
                  <p className="text-sm text-gray-600">28-31 credits</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50 rounded-r-md">
                Students minoring in Human Development and Family Sciences will learn how people change across the life
                course within the contexts of families, schools, and communities. This minor complements your Psychology major
                and provides additional perspectives on human development.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Required Core (19 Credits)</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs mr-2 mt-0.5">1</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 201</span>
                        <p className="text-sm text-gray-600">Contemporary Families in US (3)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs mr-2 mt-0.5">2</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 311</span>
                        <p className="text-sm text-gray-600">Infant & Child Development (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs mr-2 mt-0.5">3</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 313</span>
                        <p className="text-sm text-gray-600">Adolescent Development (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs mr-2 mt-0.5">4</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 314</span>
                        <p className="text-sm text-gray-600">Adult Development & Aging (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-100 text-indigo-500 text-xs mr-2 mt-0.5">5</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 341</span>
                        <p className="text-sm text-gray-600">Family Studies (4)</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Electives (Select 3 courses, 9-12 Credits)</h5>
                  <ul className="space-y-2">
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
                        <p className="text-sm text-gray-600">Parenting Research & Application (4)</p>
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
                  <p className="text-xs text-gray-500 mt-2">Additional electives include: HDFS 432, 444, 447, 460</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-800">Early Childhood Development and Education Minor</h4>
                  <p className="text-sm text-gray-600">32 credits</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 border-l-4 border-purple-200 pl-4 py-2 bg-purple-50 rounded-r-md">
                This minor focuses on early childhood development and education, providing a foundation for working with young children.
                It's an excellent complement to your Psychology major if you're interested in child development or education.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Required Core (26 Credits)</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">1</span>
                      <div>
                        <span className="font-medium text-gray-700">PSY 201</span>
                        <p className="text-sm text-gray-600">General Psychology (4)</p>
                        <p className="text-xs text-green-600">Already in your major requirements</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">2</span>
                      <div>
                        <span className="font-medium text-gray-700">PSY 202</span>
                        <p className="text-sm text-gray-600">General Psychology (4)</p>
                        <p className="text-xs text-green-600">Already in your major requirements</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">3</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 311</span>
                        <p className="text-sm text-gray-600">Infant & Child Development (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">4</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 330</span>
                        <p className="text-sm text-gray-600">Fostering Learning in Early Childhood (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">5</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 331</span>
                        <p className="text-sm text-gray-600">Directed Experience in EC (3)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">6</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 341</span>
                        <p className="text-sm text-gray-600">Family Studies (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-100 text-purple-500 text-xs mr-2 mt-0.5">7</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 431</span>
                        <p className="text-sm text-gray-600">Family, School & Community (3)</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-3 pb-2 border-b">Upper Division Electives (6 Credits)</h5>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 312</span>
                        <p className="text-sm text-gray-600">Parenting Research & Application (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 432</span>
                        <p className="text-sm text-gray-600">Children With Special Needs (3)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 444</span>
                        <p className="text-sm text-gray-600">Family Violence & Neglect (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 447</span>
                        <p className="text-sm text-gray-600">Families & Poverty (4)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-gray-100 text-gray-500 text-xs mr-2 mt-0.5">•</span>
                      <div>
                        <span className="font-medium text-gray-700">HDFS 460</span>
                        <p className="text-sm text-gray-600">Family Policy (4)</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Minor Eligibility Requirements
            </h5>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Maintain a 2.0 or better OSU GPA
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All courses must be taken for a letter (A-F) grade
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No more than two attempts at any major course or pre-requisite course
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Minor is available to all majors, except those majoring in Human Development & Family Sciences
              </li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Rest of the degree planner content */}
      {/* ... */}
    </div>
  );
};

export default DegreePlanner; 