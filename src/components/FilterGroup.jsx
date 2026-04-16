import React from 'react';

const FilterGroup = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="filter-section">
      <h3>筛选数据</h3>
      <p className="filter-subtitle">按机构运营网络 (Network) 分类：</p>
      
      <div className="radio-group">
        {categories.map(category => (
          <label key={category} className="radio-label">
            <input 
              type="radio" 
              name="network" 
              value={category} 
              checked={selectedCategory === category}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
            <span className="radio-text">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterGroup;