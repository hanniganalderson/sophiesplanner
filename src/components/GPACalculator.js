import React, { useState, useEffect } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import Tooltip from './Tooltip';

const GPACalculator = () => {
  const { completedCourses, courses } = usePlannerContext();
  
  const [courseGrades, setCourseGrades] = useState({});
  const [gpa, setGpa] = useState(0);
  
  // Initialize course grades
  useEffect(() => {
    const initialGrades = {};
    completedCourses.forEach(courseCode => {
      initialGrades[courseCode] = {
        grade: 'A',
        included: true
      };
    });
    setCourseGrades(initialGrades);
  }, [completedCourses]);
  
  // Calculate GPA whenever grades change
  useEffect(() => {
    calculateGPA();
  }, [courseGrades]);
  
  const handleGradeChange = (courseCode, grade) => {
    setCourseGrades(prev => ({
      ...prev,
      [courseCode]: {
        ...prev[courseCode],
        grade
      }
    }));
  };
  
  const handleIncludeChange = (courseCode, included) => {
    setCourseGrades(prev => ({
      ...prev,
      [courseCode]: {
        ...prev[courseCode],
        included
      }
    }));
  };
  
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    completedCourses.forEach(courseCode => {
      const courseInfo = courses.find(c => c.course_code === courseCode);
      
      if (courseInfo && courseGrades[courseCode]?.included) {
        const credits = parseInt(courseInfo.credits);
        const gradeValue = getGradeValue(courseGrades[courseCode]?.grade || 'A');
        
        totalPoints += credits * gradeValue;
        totalCredits += credits;
      }
    });
    
    const calculatedGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    setGpa(calculatedGPA);
  };
  
  const getGradeValue = (grade) => {
    const gradeValues = {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'D-': 0.7,
      'F': 0.0
    };
    
    return gradeValues[grade] || 0;
  };
  
  return (
    <div className="gpa-calculator">
      <div className="gpa-calculator-main">
        <div className="gpa-header">
          <h2 className="gpa-title">GPA Calculator</h2>
          <p className="gpa-description">
            Calculate your GPA based on completed courses
          </p>
        </div>
        
        {completedCourses.length > 0 ? (
          <>
            <div className="gpa-table-container">
              <table className="gpa-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Title</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Include</th>
                  </tr>
                </thead>
                <tbody>
                  {completedCourses.map(courseCode => {
                    const courseInfo = courses.find(c => c.course_code === courseCode);
                    return (
                      <tr key={courseCode}>
                        <td>{courseCode}</td>
                        <td>{courseInfo?.title}</td>
                        <td>{courseInfo?.credits}</td>
                        <td>
                          <select
                            value={courseGrades[courseCode]?.grade || 'A'}
                            onChange={(e) => handleGradeChange(courseCode, e.target.value)}
                          >
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="B-">B-</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="C-">C-</option>
                            <option value="D+">D+</option>
                            <option value="D">D</option>
                            <option value="D-">D-</option>
                            <option value="F">F</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={courseGrades[courseCode]?.included || false}
                            onChange={(e) => handleIncludeChange(courseCode, e.target.checked)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="gpa-summary">
              <div className="gpa-result">
                Cumulative GPA: {gpa}
              </div>
            </div>
          </>
        ) : (
          <div className="no-courses">
            <p>You haven't marked any courses as completed yet.</p>
            <p>Go to the Term Planner to mark courses as completed.</p>
          </div>
        )}
      </div>
      
      <div className="gpa-scale-card card">
        <h3 className="card-title">GPA Scale</h3>
        <table className="gpa-scale-table">
          <tbody>
            <tr>
              <td>A+/A</td>
              <td>4.0</td>
              <td>C</td>
              <td>2.0</td>
            </tr>
            <tr>
              <td>A-</td>
              <td>3.7</td>
              <td>C-</td>
              <td>1.7</td>
            </tr>
            <tr>
              <td>B+</td>
              <td>3.3</td>
              <td>D+</td>
              <td>1.3</td>
            </tr>
            <tr>
              <td>B</td>
              <td>3.0</td>
              <td>D</td>
              <td>1.0</td>
            </tr>
            <tr>
              <td>B-</td>
              <td>2.7</td>
              <td>D-</td>
              <td>0.7</td>
            </tr>
            <tr>
              <td>C+</td>
              <td>2.3</td>
              <td>F</td>
              <td>0.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GPACalculator; 