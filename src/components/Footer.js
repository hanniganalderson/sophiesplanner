import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white py-6 mt-12 animate-fadeIn" style={{ animationDelay: '1000ms' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="animate-fadeInUp" style={{ animationDelay: '1100ms' }}>
            <h3 className="text-lg font-semibold mb-2 text-white">Sophie's Psychology Planner</h3>
            <p className="text-gray-100 mb-4">
              A personalized degree planning tool created with love.
            </p>
            <p className="text-gray-200 text-sm">
              &copy; {new Date().getFullYear()} Made with 
              <span className="inline-block mx-1 animate-pulse">💜</span> 
              for Sophie
            </p>
          </div>
          <div className="flex flex-col md:items-end animate-fadeInUp" style={{ animationDelay: '1200ms' }}>
            <div className="flex items-center mb-4 group">
              <span className="text-4xl mr-2 transition-transform duration-500 group-hover:rotate-12 butterfly-flutter">🦋</span>
              <div>
                <p className="text-sm text-white">
                  Current Term: Winter 2025
                </p>
                <p className="text-xs text-gray-200 mt-1">
                  Psychology BS with HDFS Minor • Graduation: June 2028
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 