import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if this is the first visit
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);
  
  const steps = [
    {
      title: "Welcome to Your Psychology Degree Planner",
      content: "This planner is designed specifically for your Psychology degree with HDFS minor. It will help you track your progress and plan your courses each term.",
      image: "/images/butterfly-welcome.png"
    },
    {
      title: "Plan Your Terms",
      content: "Drag and drop courses into terms to create your 4-year plan. The planner will validate prerequisites and show you which courses are available each term.",
      image: "/images/term-planner.png"
    },
    {
      title: "Track Your Progress",
      content: "The degree progress tracker shows you how close you are to completing your Psychology degree requirements and HDFS minor.",
      image: "/images/progress-tracker.png"
    },
    {
      title: "Calculate Your GPA",
      content: "Enter your grades for completed courses to calculate your GPA and track your academic performance.",
      image: "/images/gpa-calculator.png"
    },
    {
      title: "Explore What-If Scenarios",
      content: "See how completing different courses would affect your degree progress and expected graduation date.",
      image: "/images/what-if.png"
    }
  ];
  
  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    navigate('/dashboard');
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipOnboarding = () => {
    completeOnboarding();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-container">
        <div className="onboarding-card">
          <button className="onboarding-close" onClick={skipOnboarding}>×</button>
          
          <div className="onboarding-progress">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          
          <div className="onboarding-content">
            <div className="onboarding-image">
              <img src={steps[currentStep].image} alt={steps[currentStep].title} />
            </div>
            
            <h2 className="onboarding-title">{steps[currentStep].title}</h2>
            <p className="onboarding-description">{steps[currentStep].content}</p>
          </div>
          
          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button className="btn btn-secondary" onClick={prevStep}>
                Previous
              </button>
            )}
            
            <button className="btn btn-primary" onClick={nextStep}>
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </button>
          </div>
          
          <div className="onboarding-skip">
            <button className="skip-link" onClick={skipOnboarding}>
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 