import React from 'react';
import NeedsFilter from './NeedsFilter';
import ServiceCategoryFilter from './ServiceCategoryFilter';

const Sidebar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  selectedNeeds, 
  onNeedsChange, 
  role,
  lastUpdated,
  matchingCount
}) => {
  const isRecipient = role === 'recipient';

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1 className="title">Give Food API</h1>
        <div className="update-status">
          <span className="dot"></span>
          Last data sync: {lastUpdated ? lastUpdated : "Not updated yet"}
        </div>
      </header>

      {isRecipient ? (
        <>
          <ServiceCategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />

          <div className="emergency-box">
            <div className="emergency-header">
              <span className="emergency-icon">⚠️</span>
              <h4>Emergency Safety Notice</h4>
            </div>
            <p>If you are in an immediate survival crisis:</p>
            <div className="emergency-buttons">
              <a href="tel:999" className="emergency-link">Call 999 (Emergency)</a>
              <a href="tel:111" className="emergency-link secondary">Call 111 (Medical)</a>
            </div>
          </div>
        </>
      ) : (
        <NeedsFilter
          selectedNeeds={selectedNeeds}
          onNeedsChange={onNeedsChange}
        />
      )}

      <div className="stats-section">
        <p>Matching locations: <strong>{matchingCount}</strong></p>
      </div>
    </aside>
  );
};

export default Sidebar;
