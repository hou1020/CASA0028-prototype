import React from 'react';
import FilterGroup from './FilterGroup';

// 内部组件：物资需求多选标签
const NeedsFilter = ({ selectedNeeds, onNeedsChange }) => {
  // 这里的 id 必须和你 App.jsx 里的 key 完全一样
  const needsConfig = [
    { 
      id: "Staple Foods and Grains", 
      label: '🍚 主食谷物', 
      color: '#3498db' 
    },
    { 
      id: "Protein and Canned Goods", 
      label: '🥩 蛋白质/罐头', 
      color: '#e67e22' 
    },
    { 
      id: "Beverages and Seasonings", 
      label: '☕ 饮品调味', 
      color: '#f1c40f' 
    },
    { 
      id: "Hygiene Products", 
      label: '🧼 个人卫生', 
      color: '#9b59b6' 
    },
    { 
      id: "Maternal and Infant Products", 
      label: '🍼 母婴专项', 
      color: '#e91e63' 
    }
  ];

  const toggleNeed = (id) => {
    if (selectedNeeds.includes(id)) {
      onNeedsChange(selectedNeeds.filter(item => item !== id));
    } else {
      onNeedsChange([...selectedNeeds, id]);
    }
  };

  return (
    <div className="needs-filter-section">
      <h4 className="filter-title">急需物资筛选 (可多选)</h4>
      <div className="needs-tags-container">
        {needsConfig.map(need => (
          <button
            key={need.id}
            className={`need-tag ${selectedNeeds.includes(need.id) ? 'active' : ''}`}
            onClick={() => toggleNeed(need.id)}
            style={{ 
              '--tag-color': need.color,
              // 选中时的边框颜色
              borderColor: selectedNeeds.includes(need.id) ? need.color : '#eee' 
            }}
          >
            {need.label}
          </button>
        ))}
      </div>
      {selectedNeeds.length > 0 && (
        <button className="clear-btn" onClick={() => onNeedsChange([])}>清除物资筛选</button>
      )}
    </div>
  );
};

const Sidebar = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  // 👈 接收 App.jsx 传来的新 props
  selectedNeeds, 
  onNeedsChange, 
  count, 
  lastUpdated 
}) => {
  return (
    <div className="sidebar">
      <h1 className="title">Give Food API</h1>
      
      <div className="update-status">
        <span className="dot"></span>
        数据最后同步: {lastUpdated ? lastUpdated : "尚未更新"}
      </div>

      <p className="description">
        英国食物银行交互式地图原型。提供基于人群画像与即时物资缺口的精准匹配。
      </p>

      {/* 1. 原有人群分类筛选 */}
      <div className="filter-section">
        <h4 className="filter-title">服务对象分类</h4>
        <FilterGroup 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      <hr className="divider" />

      {/* 2. 新增：物资需求多选筛选 */}
      <NeedsFilter 
        selectedNeeds={selectedNeeds}
        onNeedsChange={onNeedsChange}
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
      
      <div className="stats-section">
        <p>满足条件的地点：<strong>{count}</strong> 个</p>
      </div>
    </div>
  );
};

export default Sidebar;