import { useState, useRef, useEffect } from 'react';

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
    <div
      ref={dropdownRef}
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        minWidth: '200px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onEnableAll}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
            }}
            title="Enable All"
          >
            ✓
          </button>
          <button
            onClick={onDisableAll}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
            }}
            title="Disable All"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{selectedCount} of {totalCount} selected</span>
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div
          style={{
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={placeholder}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              overflowY: 'auto',
              maxHeight: '240px',
              padding: '8px',
            }}
          >
            {filteredItems.length === 0 ? (
              <div style={{ padding: '8px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.1)', fontSize: '12px' }}>
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <label
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item)}
                    onChange={() => onToggle(item)}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {item}
                  </span>
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
