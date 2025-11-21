import './App.css'
import EarthViewer from './components/EarthViewer'
import type { LocationMarker } from './components/EarthViewer'
import { Color3 } from '@babylonjs/core'

function App() {
  // Testing scenario: Use well-known geographic points to verify coordinate conversion
  // These locations help identify if the model orientation or conversion is incorrect
  const locations: LocationMarker[] = [
    // === CARDINAL POINTS (for testing coordinate system) ===
    {
      id: 'north-pole',
      latitude: 90,
      longitude: 0,
      name: 'North Pole (Should be at top)',
      color: new Color3(1, 1, 1), // White
      size: 0.08
    },
    {
      id: 'south-pole',
      latitude: -90,
      longitude: 0,
      name: 'South Pole (Should be at bottom)',
      color: new Color3(0.5, 0.5, 0.5), // Gray
      size: 0.08
    },
    {
      id: 'null-island',
      latitude: 0,
      longitude: 0,
      name: 'Null Island (0°N 0°E - Gulf of Guinea, West Africa)',
      color: new Color3(1, 1, 0), // Yellow
      size: 0.06
    },
    {
      id: 'equator-180',
      latitude: 0,
      longitude: 180,
      name: 'Equator at 180° (Pacific Ocean, opposite side)',
      color: new Color3(0, 1, 1), // Cyan
      size: 0.06
    },
    
    // === MAJOR CITIES (for practical verification) ===
    {
      id: 'new-york',
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York (Should be in Eastern USA)',
      color: new Color3(1, 0, 0), // Red
      size: 0.05
    },
    {
      id: 'london',
      latitude: 51.5074,
      longitude: -0.1278,
      name: 'London (Should be near 0° longitude)',
      color: new Color3(0, 1, 0), // Green
      size: 0.05
    },
    {
      id: 'tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      name: 'Tokyo (Should be in Eastern Asia)',
      color: new Color3(0, 0, 1), // Blue
      size: 0.05
    },
    {
      id: 'sydney',
      latitude: -33.8688,
      longitude: 151.2093,
      name: 'Sydney (Should be in Australia, Southern Hemisphere)',
      color: new Color3(1, 0.5, 0), // Orange
      size: 0.05
    },
    {
      id: 'sao-paulo',
      latitude: -23.5505,
      longitude: -46.6333,
      name: 'São Paulo (Should be in South America)',
      color: new Color3(1, 0, 1), // Magenta
      size: 0.05
    }
  ];

  /* 
   * TESTING CHECKLIST:
   * ✓ North Pole (white) should be at the very top
   * ✓ South Pole (gray) should be at the very bottom
   * ✓ Null Island (yellow) should be on equator where Prime Meridian crosses
   * ✓ Pacific marker (cyan) should be on opposite side of Null Island
   * ✓ New York (red) should be in North America, western hemisphere
   * ✓ London (green) should be very close to Prime Meridian (near yellow marker)
   * ✓ Tokyo (blue) should be in Asia, eastern hemisphere
   * ✓ Sydney (orange) should be in Southern Hemisphere, eastern side
   * ✓ São Paulo (magenta) should be in South America, western hemisphere
   * 
   * If markers appear:
   * - Rotated by 90°/180°/270°: Adjust theta offset in latLonToVector3
   * - Mirrored: Remove or add negative sign to X coordinate
   * - At wrong latitude: Check phi calculation
   * - All bunched together: Verify earthRadius parameter matches model size
   */

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
          earthRadius={0.99} // Adjust if markers don't align with model surface
        />
      </div>
    </div>
  )
}

export default App
