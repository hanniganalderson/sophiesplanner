import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);
  
  // Position the tooltip
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      
      // Reset position to calculate proper dimensions
      tooltip.style.top = '';
      tooltip.style.left = '';
      tooltip.style.bottom = '';
      tooltip.style.right = '';
      
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Calculate position based on specified position
      switch (position) {
        case 'top':
          tooltip.style.bottom = `${window.innerHeight - trigger.top + 10}px`;
          tooltip.style.left = `${trigger.left + (trigger.width / 2) - (tooltipRect.width / 2)}px`;
          break;
        case 'bottom':
          tooltip.style.top = `${trigger.bottom + 10}px`;
          tooltip.style.left = `${trigger.left + (trigger.width / 2) - (tooltipRect.width / 2)}px`;
          break;
        case 'left':
          tooltip.style.top = `${trigger.top + (trigger.height / 2) - (tooltipRect.height / 2)}px`;
          tooltip.style.right = `${window.innerWidth - trigger.left + 10}px`;
          break;
        case 'right':
          tooltip.style.top = `${trigger.top + (trigger.height / 2) - (tooltipRect.height / 2)}px`;
          tooltip.style.left = `${trigger.right + 10}px`;
          break;
        default:
          tooltip.style.bottom = `${window.innerHeight - trigger.top + 10}px`;
          tooltip.style.left = `${trigger.left + (trigger.width / 2) - (tooltipRect.width / 2)}px`;
      }
      
      // Ensure tooltip stays within viewport
      const tooltipUpdatedRect = tooltip.getBoundingClientRect();
      
      if (tooltipUpdatedRect.left < 0) {
        tooltip.style.left = '10px';
      } else if (tooltipUpdatedRect.right > window.innerWidth) {
        tooltip.style.left = `${window.innerWidth - tooltipUpdatedRect.width - 10}px`;
      }
      
      if (tooltipUpdatedRect.top < 0) {
        tooltip.style.top = '10px';
        tooltip.style.bottom = 'auto';
      } else if (tooltipUpdatedRect.bottom > window.innerHeight) {
        tooltip.style.bottom = '10px';
        tooltip.style.top = 'auto';
      }
    }
  }, [isVisible, position]);
  
  return (
    <div className="tooltip-container">
      <div 
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          role="tooltip"
        >
          <div className="tooltip-content">{content}</div>
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 