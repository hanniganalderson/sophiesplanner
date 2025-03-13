// Debounce function to limit how often a function can be called
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format a term (e.g., "Fall 2024") into a readable date
export const termToDate = (term) => {
  const [season, year] = term.split(' ');
  const monthMap = {
    'Fall': 8, // September
    'Winter': 0, // January of next year
    'Spring': 4, // May
  };
  
  let month = monthMap[season];
  let adjustedYear = parseInt(year);
  
  // Winter term is in the next calendar year
  if (season === 'Winter') {
    adjustedYear += 1;
  }
  
  return new Date(adjustedYear, month, 1);
};

// Calculate expected graduation date based on planned courses
export const calculateGraduationDate = (plannedCourses) => {
  if (Object.keys(plannedCourses).length === 0) return null;
  
  // Find the latest term with courses
  const latestTerm = Object.keys(plannedCourses)
    .filter(term => plannedCourses[term].length > 0)
    .sort((a, b) => termToDate(b) - termToDate(a))[0];
  
  if (!latestTerm) return null;
  
  // Convert to a readable date format
  const date = termToDate(latestTerm);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long'
  });
}; 