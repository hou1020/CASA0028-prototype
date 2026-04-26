import React from 'react';

const categoryColors = {
  "儿童与青少年": "#3b82f6",
  "无家可归者救助": "#f97316",
  "医疗与残障支持": "#10b981",
  "老年人援助": "#8b5cf6",
  "宗教信仰组织": "#64748b",
  "综合贫困救助": "#ef4444",
  "All": "#3b82f6",
  "其他/常规援助": "#94a3b8"
};

const ServiceCategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <section className="sidebar-section">
      <h4 className="filter-title">服务对象分类</h4>
      <div className="filter-group">
        <h3>资源筛选</h3>
        <p className="filter-subtitle">按服务对象分类，提升定位效率：</p>

        <div className="radio-group">
          {categories.map(category => {
            const isSelected = selectedCategory === category;
            const themeColor = categoryColors[category] || "#94a3b8";

            return (
              <label
                key={category}
                className={`radio-label ${isSelected ? 'active' : ''}`}
                style={{
                  borderLeft: `5px solid ${themeColor}`,
                  backgroundColor: isSelected ? `${themeColor}22` : '#0f172a',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                }}
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={isSelected}
                  onChange={(event) => onCategoryChange(event.target.value)}
                />
                <span className="category-dot" style={{ backgroundColor: themeColor }}></span>
                <span className="radio-text">{category}</span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoryFilter;
