import React from 'react';
import './MaintenancePage.css';

const MaintenancePage = () => {
  return (
    <div className="maintenance">
      <div className="maintenance-container">
        <div className="maintenance-content">
          <div className="maintenance-badge">Scheduled Maintenance</div>
          
          <h1 className="maintenance-heading">
            We'll be back shortly
          </h1>
          
          <p className="maintenance-text">
            We're currently performing scheduled maintenance to improve your experience. 
            This won't take long.
          </p>

          <div className="maintenance-status">
            <div className="status-dot"></div>
            <span>Maintenance in progress</span>
          </div>

          <div className="maintenance-contact">
            <span>Questions? </span>
            <a href="mailto:support@sangbadbangla.news">support@sangbadbangla.news</a>
          </div>
        </div>

        <footer className="maintenance-footer">
          <span>© 2024 Sangbad Bangla</span>
        </footer>
      </div>
    </div>
  );
};

export default MaintenancePage;
