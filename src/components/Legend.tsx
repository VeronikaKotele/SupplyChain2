import React from 'react';
import './Legend.css';

interface LegendItem {
  label: string;
  color: string;
}

interface LegendProps {
  title: string;
  items: LegendItem[];
}

const Legend: React.FC<LegendProps> = ({ title, items }) => {
  return (
    <div className="legend-container">
      <h3 className="legend-title">{title}</h3>
      <div className="legend-items">
        {items.map((item, index) => (
          <div key={index} className="legend-item">
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

export default Legend;
