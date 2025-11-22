import React from 'react';
import './LegendFilter.css';

interface LegendFilterItem {
  label: string;
  color: string;
  enabled?: boolean;
}

interface LegendFilterProps {
  title: string;
  items: LegendFilterItem[];
  onToggle?: (index: number) => void;
}

const LegendFilter: React.FC<LegendFilterProps> = ({ title, items, onToggle }) => {
  return (
    <div className="legend-container">
      <h3 className="legend-title">{title}</h3>
      <div className="legend-items">
        {items.map((item, index) => (
          <div 
            key={index} 
            className={`legend-item ${onToggle ? 'legend-item-clickable' : ''} ${item.enabled === false ? 'legend-item-disabled' : ''}`}
            onClick={() => onToggle?.(index)}
          >
            <div 
              className="legend-color-box" 
              style={{ backgroundColor: item.color }}
            />
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendFilter;
