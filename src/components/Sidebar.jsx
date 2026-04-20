import React from 'react';
import FilterGroup from './FilterGroup';

const Sidebar = ({ categories, selectedCategory, onCategoryChange, count, lastUpdated }) => {
  return (
    <div className="sidebar">
      <h1 className="title">Give Food API</h1>
      {/* 👈 插入最后更新时间 */}
      <div className="update-status">
        <span className="dot"></span>
        数据最后同步: {lastUpdated}
      </div>
      <p className="description">
        英国食物银行交互式地图原型。数据每日从 Give Food 官方接口自动更新。
      </p>

      <FilterGroup 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

           {/* 在统计信息上方插入紧急联系模块 */}
     <div className="emergency-box">
       <div className="emergency-header">
         <span className="emergency-icon">⚠️</span>
         <h4>紧急安全提示</h4>
       </div>
       <p>如果您正处于即刻的生存危机或危险中：</p>
       <div className="emergency-buttons">
         <a href="tel:999" className="emergency-link">拨打 999 (紧急)</a>
         <a href="tel:111" className="emergency-link secondary">拨打 111 (非紧急医疗)</a>
       </div>
     </div>
      
      <div className="stats-section">
        <p>当前地图显示：<strong>{count}</strong> 个地点</p>
      </div>
    </div>
  );
};

export default Sidebar;