import React from 'react';

// 定义颜色映射（确保这里的名字和 App.jsx 清洗后的名字一致）
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

const FilterGroup = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="filter-section">
      <h3>资源筛选</h3>
      <p className="filter-subtitle">按服务对象分类，提升定位效率：</p>
      
      <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {categories.map(category => {
          const isSelected = selectedCategory === category;
          const themeColor = categoryColors[category] || "#94a3b8";

          return (
            <label 
              key={category} 
              // 动态类名：选中时加上 active
              className={`radio-label ${isSelected ? 'active' : ''}`}
              // 核心样式修改
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: `5px solid ${themeColor}`, // 彩色边框
                backgroundColor: isSelected ? `${themeColor}22` : '#0f172a', // 选中变色
                color: isSelected ? '#ffffff' : '#cbd5e1',
                fontSize: '14px'
              }}
            >
              <input 
                type="radio" 
                name="category" 
                value={category} 
                checked={isSelected}
                onChange={(e) => onCategoryChange(e.target.value)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              {/* 彩色圆点辅助标识 */}
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: themeColor,
                marginRight: '10px',
                flexShrink: 0
              }}></span>
              <span className="radio-text">{category}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default FilterGroup;