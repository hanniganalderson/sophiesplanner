// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlannerProvider } from './context/PlannerContext';

// Components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import TermPlanner from './components/TermPlanner';
import CourseSearch from './components/CourseSearch';
import DegreeProgress from './components/DegreeProgress';
import Footer from './components/Footer';

// Styles
import './styles.css';

const App = () => {
  return (
    <PlannerProvider>
      <Router>
        <div className="app">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner" element={<TermPlanner />} />
              <Route path="/search" element={<CourseSearch />} />
              <Route path="/progress" element={<DegreeProgress />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </PlannerProvider>
  );
};

export default App;