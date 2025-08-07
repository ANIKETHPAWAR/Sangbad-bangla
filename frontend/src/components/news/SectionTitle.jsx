import React from 'react';
import './SectionTitle.css';

const SectionTitle = ({ 
  title, 
  subtitle, 
  icon, 
  variant = 'default',
  showBorder = true,
  align = 'left' 
}) => {
  return (
    <div className={`section-title section-title--${variant} section-title--${align}`}>
      {showBorder && <div className="section-title-border"></div>}
      
      <div className="section-title-content">
        {icon && (
          <div className="section-title-icon">
            {icon}
          </div>
        )}
        
        <div className="section-title-text">
          <h2 className="section-title-main">
            {title}
          </h2>
          {subtitle && (
            <p className="section-title-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {showBorder && <div className="section-title-border"></div>}
    </div>
  );
};

export default SectionTitle; 