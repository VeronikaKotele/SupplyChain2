import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/EarthViewer'
import PowerBIDashboard from './components/PowerBIDashboard'
import type { LocationMarker } from './components/LocationMarker'
import type { ConnectionMarker } from './components/ConnectionMarker'
import { loadLocationsFromCSV } from './utils/locationLoader'
import { loadConnectionsFromCSV } from './utils/connectionLoader'

function App() {
  const [locations, setLocations] = useState<LocationMarker[]>([]);
  const [connections, setConnections] = useState<ConnectionMarker[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(100);

  useEffect(() => {
    // Load locations and connections from CSV files
    loadLocationsFromCSV('/data/locations.csv').then(setLocations);
    loadConnectionsFromCSV('/data/connections.csv').then((conns) => {
      setConnections(conns);
      // Calculate max amount for scaling
      if (conns.length > 0) {
        const max = Math.max(...conns.map(c => c.amount));
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
          <PowerBIDashboard
            embedUrl={import.meta.env.VITE_POWERBI_EMBED_URL}
          />
        </div>
        <div className="viewer-container">
          <h2>Interactive 3D Earth Viewer</h2>
          <p>Use mouse to rotate, scroll to zoom</p>
          <EarthViewer 
            modelPath="/models/earth/Earth.obj" 
            materialPath="/models/earth/Earth.mtl"
            scale={0.00016}
            locations={locations}
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
