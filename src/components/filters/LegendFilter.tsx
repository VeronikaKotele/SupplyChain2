import React from 'react';
import './Filters.css';

interface LegendFilterItem {
  label: string;
  color: string;
  enabled?: boolean;
}

interface LegendFilterProps {
  title: string;
  items: LegendFilterItem[];
  onToggle?: (label: string) => void;
  onEnableAll?: () => void;
  onDisableAll?: () => void;
}

const LegendFilter: React.FC<LegendFilterProps> = ({ title, items, onToggle, onEnableAll, onDisableAll }) => {
  return (
    <div className="filter-container">
      <div className="filter-header">
        <h3 className="filter-title">{title}</h3>
        {(onEnableAll || onDisableAll) && (
          <div className="filter-buttons">
            {onEnableAll && (
              <button 
                onClick={onEnableAll}
                title="Enable all"
                className="filter-button"
              >
                ✓
              </button>
            )}
            {onDisableAll && (
              <button 
                onClick={onDisableAll}
                title="Disable all"
                className="filter-button"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
      <div className="legend-items">
        {items.map(item => (
          <div 
            key={item.label} 
            className={`legend-item ${onToggle ? 'legend-item-clickable' : ''} ${item.enabled === false ? 'legend-item-disabled' : ''}`}
            onClick={() => onToggle?.(item.label)}
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
