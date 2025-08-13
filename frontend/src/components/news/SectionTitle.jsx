import React from 'react';
import './SectionTitle.css';

const SectionTitle = ({ 
  title, 
  subtitle, 
  icon, 
  variant = 'default',
  showBorder = true,
  align = 'left',
  showDecorativeLines = false
}) => {
  return (
    <div className={`section-title section-title--${variant} section-title--${align}`}>
      {/* Always show left border for non-center titles */}
      {align !== 'center' && <div className="section-title-border-left"></div>}
      
      {/* Decorative lines for trending news */}
      
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
      
      
      
      {/* Always show right border for non-center titles */}
      {align !== 'center' && <div className="section-title-border-right"></div>}
    </div>
  );
};

export default SectionTitle; 