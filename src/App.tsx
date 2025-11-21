import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/EarthViewer'
import PowerBIDashboard from './components/PowerBIDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import type { EntityMarker } from './components/EntityMarker'
import type { ConnectionMarker } from './components/ConnectionMarker'
import { loadEntitiesFromCSV } from './utils/entitiesLoader'
import { loadConnectionsFromCSV } from './utils/connectionLoader'

function App() {
  const [entities, setEntities] = useState<EntityMarker[]>([]);
  const [connections, setConnections] = useState<ConnectionMarker[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(100);

  useEffect(() => {
    // Load entities and connections from CSV files
    loadEntitiesFromCSV('/data/entities.csv').then(setEntities);
    loadConnectionsFromCSV('/data/connections.csv').then((conns) => {
      setConnections(conns);
      // Calculate max amount for scaling
      if (conns.length > 0) {
        const max = Math.max(...conns.map(c => c.amount ?? 1));
        setMaxAmount(max);
      }
    });
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>Supply Chain Visualization</h1>
      </header>
      <div className="content-container">
        <div className="dashboard-container">
          <ErrorBoundary
            fallback={
              <div style={{ padding: '20px', color: '#ff6b6b' }}>
                <h2>Failed to load Power BI Dashboard</h2>
                <p>Please check your embed URL configuration in the .env file.</p>
              </div>
            }
          >
            <PowerBIDashboard
              embedUrl={import.meta.env.VITE_POWERBI_EMBED_URL}
            />
          </ErrorBoundary>
        </div>
        <div className="viewer-container">
          <h2>Interactive 3D Earth Viewer</h2>
          <p>Use mouse to rotate, scroll to zoom</p>
          <EarthViewer 
            modelPath="/models/earth/Earth.obj" 
            materialPath="/models/earth/Earth.mtl"
            scale={0.00016}
            entities={entities}
            connections={connections}
            maxConnectionAmount={maxAmount}
            earthRadius={1} // Adjust if markers don't align with model surface
          />
        </div>
      </div>
    </div>
  )
}

export default App
