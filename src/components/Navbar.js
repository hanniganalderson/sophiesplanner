import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 animate-fadeIn ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-primary text-2xl mr-2 transition-transform duration-500 group-hover:rotate-12">🦋</span>
              <span className="font-semibold text-xl text-primary transition-all duration-300 group-hover:text-primary-dark">Sophie's Psychology Planner</span>
            </Link>
          </div>
          
          {/* Desktop menu - simplified */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/dashboard') || isActive('/') 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 hover:text-primary hover:bg-secondary hover:translate-y-[-2px]'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/planner" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/planner') 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 hover:text-primary hover:bg-secondary hover:translate-y-[-2px]'
              }`}
            >
              Term Planner
            </Link>
            <Link 
              to="/search" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/search') 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 hover:text-primary hover:bg-secondary hover:translate-y-[-2px]'
              }`}
            >
              Course Search
            </Link>
            <Link 
              to="/progress" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                isActive('/progress') 
                  ? 'text-white bg-primary shadow-md' 
                  : 'text-gray-600 hover:text-primary hover:bg-secondary hover:translate-y-[-2px]'
              }`}
            >
              Degree Progress
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary transition-colors duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6 transition-transform duration-300 rotate-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - simplified */}
      <div 
        className={`md:hidden bg-white border-t border-gray-200 transition-all duration-500 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
              isActive('/dashboard') || isActive('/') 
                ? 'text-white bg-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-secondary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/planner" 
            className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
              isActive('/planner') 
                ? 'text-white bg-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-secondary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Term Planner
          </Link>
          <Link 
            to="/search" 
            className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
              isActive('/search') 
                ? 'text-white bg-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-secondary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Course Search
          </Link>
          <Link 
            to="/progress" 
            className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
              isActive('/progress') 
                ? 'text-white bg-primary' 
                : 'text-gray-600 hover:text-primary hover:bg-secondary'
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Degree Progress
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 