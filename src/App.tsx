import './App.css'
import EarthViewer from './components/EarthViewer'
import type { LocationMarker } from './components/EarthViewer'
import { Color3 } from '@babylonjs/core'

function App() {
  // Example locations
  const locations: LocationMarker[] = [
    {
      id: 'new-york',
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York',
      color: new Color3(1, 0, 0), // Red
      size: 0.05
    },
    {
      id: 'london',
      latitude: 51.5074,
      longitude: -0.1278,
      name: 'London',
      color: new Color3(0, 1, 0), // Green
      size: 0.05
    },
    {
      id: 'tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      name: 'Tokyo',
      color: new Color3(0, 0, 1), // Blue
      size: 0.05
    },
    {
      id: 'sydney',
      latitude: -33.8688,
      longitude: 151.2093,
      name: 'Sydney',
      color: new Color3(1, 1, 0), // Yellow
      size: 0.05
    },
    {
      id: 'sao-paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      name: 'São Paulo',
      color: new Color3(1, 0, 1), // Magenta
      size: 0.05
    }
  ];

  return (
    <div className="app-container">
      <header>
        <h1>Interactive 3D Earth Viewer</h1>
        <p>Use mouse to rotate, scroll to zoom</p>
      </header>
      <div className="viewer-container">
        <EarthViewer 
          modelPath="/models/LowPolyEarth2.obj" 
          materialPath="/models/LowPolyEarth2.mtl"
          locations={locations}
        />
      </div>
    </div>
  )
}

export default App
