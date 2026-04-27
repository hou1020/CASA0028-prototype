import React from 'react';

const categoryColors = {
  "Children and Young People": "#06b6d4",
  "Homelessness Support": "#10b981",
  "Health and Disability Support": "#8b5cf6",
  "Older People Support": "#8b5cf6",
  "Faith-Based Organisations": "#64748b",
  "Poverty Relief": "#3b82f6",
  "All": "#3b82f6",
  "Other / General Support": "#64748b"
};

const whiteText = { color: '#ffffff' };

const ServiceCategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <section className="sidebar-section service-category-filter">
      <h4 className="filter-title" style={whiteText}>Service User Category</h4>
      <div className="filter-group">
        <h3 style={whiteText}>Resource Filter</h3>
        <p className="filter-subtitle" style={whiteText}>Filter by service user category to improve search accuracy:</p>

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
                  color: '#ffffff',
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
                <span className="radio-text" style={whiteText}>{category}</span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCategoryFilter;
