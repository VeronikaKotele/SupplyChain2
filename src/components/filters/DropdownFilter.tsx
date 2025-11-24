import { useState, useRef, useEffect } from 'react';
import './Filters.css';

interface DropdownFilterProps {
  title: string;
  items: string[];
  selectedItems: Set<string>;
  onToggle: (item: string) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;
  placeholder?: string;
}

const DropdownFilter = ({ 
  title, 
  items, 
  selectedItems,
  onToggle, 
  onEnableAll, 
  onDisableAll,
  placeholder = 'Search...'
}: DropdownFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedCount = selectedItems.size;
  const totalCount = items.length;

  return (
    <div ref={dropdownRef} className="filter-container">
      <div className="filter-header">
        <h3 className="filter-title">{title}</h3>
        <div className="filter-buttons">
          <button
            onClick={onEnableAll}
            className="filter-button"
            title="Enable All"
          >
            ✓
          </button>
          <button
            onClick={onDisableAll}
            className="filter-button"
            title="Disable All"
          >
            ✕
          </button>
        </div>
      </div>

      <div onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        <span>{selectedCount} of {totalCount} selected</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-search">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={placeholder}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="dropdown-items">
            {filteredItems.length === 0 ? (
              <div className="dropdown-empty">No items found</div>
            ) : (
              filteredItems.map((item) => (
                <label key={item} className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item)}
                    onChange={() => onToggle(item)}
                  />
                  <span className="dropdown-item-label">{item}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownFilter;
