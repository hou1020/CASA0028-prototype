import React from 'react';

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

const NeedsFilter = ({ selectedNeeds, onNeedsChange }) => {
  const toggleNeed = (id) => {
    if (selectedNeeds.includes(id)) {
      onNeedsChange(selectedNeeds.filter(item => item !== id));
    } else {
      onNeedsChange([...selectedNeeds, id]);
    }
  };

  return (
    <section className="sidebar-section needs-filter-section">
      <h4 className="filter-title">急需物资筛选 (可多选)</h4>
      <div className="needs-tags-container">
        {needsConfig.map(need => {
          const isSelected = selectedNeeds.includes(need.id);

          return (
            <button
              key={need.id}
              className={`need-tag ${isSelected ? 'active' : ''}`}
              onClick={() => toggleNeed(need.id)}
              style={{
                '--tag-color': need.color,
                borderColor: isSelected ? need.color : '#334155'
              }}
            >
              {need.label}
            </button>
          );
        })}
      </div>
      {selectedNeeds.length > 0 && (
        <button className="clear-btn" onClick={() => onNeedsChange([])}>清除物资筛选</button>
      )}
    </section>
  );
};

export default NeedsFilter;
