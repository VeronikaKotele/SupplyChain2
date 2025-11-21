import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/EarthViewer'
import type { LocationMarker } from './components/EarthViewer'
import { loadLocationsFromCSV } from './utils/locationLoader'

function App() {
  const [locations, setLocations] = useState<LocationMarker[]>([]);

  useEffect(() => {
    // Load locations from CSV file
    loadLocationsFromCSV('/data/locations.csv').then(setLocations);
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>Interactive 3D Earth Viewer</h1>
        <p>Use mouse to rotate, scroll to zoom</p>
      </header>
      <div className="viewer-container">
        <EarthViewer 
          modelPath="/models/earth/Earth.obj" 
          materialPath="/models/earth/Earth.mtl"
          scale={0.00016}
          locations={locations}
          earthRadius={1} // Adjust if markers don't align with model surface
        />
      </div>
    </div>
  )
}

export default App
