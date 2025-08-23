import React from 'react';
import './StaticPage.css';

const StaticPage = ({ title, children }) => {
  return (
    <div className="static-wrap">
      <article className="static-card">
        <header className="static-header">
          <h1 className="static-title">{title}</h1>
        </header>
        <div className="static-content">
          {children}
        </div>
      </article>
    </div>
  );
};

export default StaticPage;


