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
  totalCount
}) => {
  const isRecipient = role === 'recipient';

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1 className="title">Give Food API</h1>
        <div className="update-status">
          <span className="dot"></span>
          数据最后同步: {lastUpdated ? lastUpdated : "尚未更新"}
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
              <h4>紧急安全提示</h4>
            </div>
            <p>如果您正处于即刻的生存危机中：</p>
            <div className="emergency-buttons">
              <a href="tel:999" className="emergency-link">拨打 999 (紧急)</a>
              <a href="tel:111" className="emergency-link secondary">拨打 111 (医疗)</a>
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
        <p>一共有多少条数据：<strong>{totalCount}</strong> 条</p>
      </div>
    </aside>
  );
};

export default Sidebar;
