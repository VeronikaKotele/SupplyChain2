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
  onEnableAll?: () => void;
  onDisableAll?: () => void;
}

const LegendFilter: React.FC<LegendFilterProps> = ({ title, items, onToggle, onEnableAll, onDisableAll }) => {
  return (
    <div className="legend-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="legend-title" style={{ margin: 0 }}>{title}</h3>
        {(onEnableAll || onDisableAll) && (
          <div style={{ display: 'flex', gap: '2px' }}>
            {onEnableAll && (
              <button 
                onClick={onEnableAll}
                title="Enable all"
                style={{
                  padding: '1px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1
                }}
              >
                ✓
              </button>
            )}
            {onDisableAll && (
              <button 
                onClick={onDisableAll}
                title="Disable all"
                style={{
                  padding: '1px 4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
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
