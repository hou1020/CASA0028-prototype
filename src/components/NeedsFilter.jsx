import React from 'react';

const needsConfig = [
  {
    id: "Staple Foods and Grains",
    label: '🍚 Staples and Grains',
    color: '#3498db'
  },
  {
    id: "Protein and Canned Goods",
    label: '🥩 Protein and Canned Goods',
    color: '#e67e22'
  },
  {
    id: "Beverages and Seasonings",
    label: '☕ Drinks and Seasonings',
    color: '#f1c40f'
  },
  {
    id: "Hygiene Products",
    label: '🧼 Hygiene Products',
    color: '#9b59b6'
  },
  {
    id: "Maternal and Infant Products",
    label: '🍼 Baby and Maternal Items',
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
      <h4 className="filter-title">Urgent Needs Filter (multi-select)</h4>
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
        <button className="clear-btn" onClick={() => onNeedsChange([])}>Clear needs filter</button>
      )}
    </section>
  );
};

export default NeedsFilter;
