import React, { useState } from 'react';
import { usePlannerContext } from '../context/PlannerContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const ExportPlan = () => {
  const { 
    plannedCourses, 
    completedCourses, 
    courses,
    calculateCredits,
    degreeRequirements
  } = usePlannerContext();
  
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Export as PDF
  const exportAsPDF = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById('plan-export-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Psychology_Degree_Plan.pdf');
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Export as JSON
  const exportAsJSON = () => {
    setIsExporting(true);
    
    try {
      const data = {
        plannedCourses,
        completedCourses,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'Psychology_Degree_Plan.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Export as CSV
  const exportAsCSV = () => {
    setIsExporting(true);
    
    try {
      // Create CSV header
      let csv = 'Term,Course Code,Course Title,Credits,Prerequisites\n';
      
      // Add planned courses by term
      Object.entries(plannedCourses).forEach(([term, courseCodes]) => {
        courseCodes.forEach(code => {
          const course = courses.find(c => c.course_code === code);
          if (course) {
            const prereqs = course.prerequisites ? course.prerequisites.join('; ') : '';
            csv += `${term},${course.course_code},"${course.title}",${course.credits},"${prereqs}"\n`;
          }
        });
      });
      
      // Create download link
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const exportFileDefaultName = 'Psychology_Degree_Plan.csv';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle export based on selected format
  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        exportAsPDF();
        break;
      case 'json':
        exportAsJSON();
        break;
      case 'csv':
        exportAsCSV();
        break;
      default:
        exportAsPDF();
    }
  };
  
  return (
    <div className="export-plan">
      <div className="export-header">
        <h2 className="export-title">Export Your Degree Plan</h2>
        <p className="export-description">
          Export your Psychology degree plan to share with your advisor or save for your records.
        </p>
      </div>
      
      <div className="export-options">
        <div className="export-format-selector">
          <label htmlFor="export-format">Export Format:</label>
          <select 
            id="export-format" 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
            className="select-input"
          >
            <option value="pdf">PDF Document</option>
            <option value="json">JSON Data</option>
            <option value="csv">CSV Spreadsheet</option>
          </select>
        </div>
        
        <button 
          className="btn btn-primary export-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export Plan'}
        </button>
        
        {exportSuccess && (
          <div className="export-success">
            <span className="success-icon">✓</span>
            <span className="success-message">Export successful!</span>
          </div>
        )}
      </div>
      
      <div id="plan-export-content" className="export-preview">
        <div className="export-preview-header">
          <h1>Psychology Degree Plan</h1>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="export-summary">
          <div className="summary-item">
            <span className="summary-label">Total Credits Completed:</span>
            <span className="summary-value">{calculateCredits(completedCourses)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Credits Planned:</span>
            <span className="summary-value">
              {calculateCredits(Object.values(plannedCourses).flat())}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Credits Required:</span>
            <span className="summary-value">
              {degreeRequirements.psychology_bs.total_credits}
            </span>
          </div>
        </div>
        
        <div className="export-plan-by-term">
          <h2>Course Plan by Term</h2>
          
          {Object.keys(plannedCourses).length > 0 ? (
            Object.entries(plannedCourses)
              .sort(([termA], [termB]) => {
                const [seasonA, yearA] = termA.split(' ');
                const [seasonB, yearB] = termB.split(' ');
                
                if (yearA !== yearB) {
                  return parseInt(yearA) - parseInt(yearB);
                }
                
                const seasonOrder = { 'Fall': 0, 'Winter': 1, 'Spring': 2 };
                return seasonOrder[seasonA] - seasonOrder[seasonB];
              })
              .map(([term, courseCodes]) => (
                <div key={term} className="export-term">
                  <h3 className="term-title">{term}</h3>
                  
                  {courseCodes.length > 0 ? (
                    <table className="term-courses-table">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseCodes.map(code => {
                          const course = courses.find(c => c.course_code === code);
                          return course ? (
                            <tr key={code}>
                              <td>{course.course_code}</td>
                              <td>{course.title}</td>
                              <td>{course.credits}</td>
                            </tr>
                          ) : null;
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="no-courses">No courses planned for this term.</p>
                  )}
                </div>
              ))
          ) : (
            <p className="no-plan">No courses have been planned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPlan; 