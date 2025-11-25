import type { CompanyMarker } from './interfaces/CompanyMarker';

export interface SelectedCompanyInfoProps {
  selectedMarker: CompanyMarker | null;
  onClose: () => void;
}

const SelectedCompanyInfo: React.FC<SelectedCompanyInfoProps> = ({ selectedMarker, onClose }) => { 
    return (
      selectedMarker &&
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.05)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
            zIndex: 1000,
            minWidth: '250px',
            maxWidth: '350px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Entity Details</h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div><strong>Name:</strong> {selectedMarker.name || 'N/A'}</div>
            {selectedMarker.type && <div><strong>Type:</strong> {selectedMarker.type}</div>}
            {selectedMarker.location_county && <div><strong>Country:</strong> {selectedMarker.location_county}</div>}
            {selectedMarker.location_city && <div><strong>City:</strong> {selectedMarker.location_city}</div>}
            <div><strong>ID:</strong> {selectedMarker.id}</div>
          </div>
        </div>
    );
};

export default SelectedCompanyInfo;