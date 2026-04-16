import React from 'react';
import FilterGroup from './FilterGroup';

const Sidebar = ({ categories, selectedCategory, onCategoryChange, count }) => {
  return (
    <div className="sidebar">
      <h1 className="title">Give Food API</h1>
      <p className="description">
        英国食物银行交互式地图原型。数据每日从 Give Food 官方接口自动更新。
      </p>

      <FilterGroup 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      <div className="stats-section">
        <p>当前地图显示：<strong>{count}</strong> 个地点</p>
      </div>
    </div>
  );
};

export default Sidebar;