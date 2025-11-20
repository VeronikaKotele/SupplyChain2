import './App.css'
import EarthViewer from './components/EarthViewer'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>Interactive 3D Earth Viewer</h1>
        <p>Use mouse to rotate, scroll to zoom</p>
      </header>
      <div className="viewer-container">
        <EarthViewer modelPath="/models/LowPolyEarth2.obj" materialPath="/models/LowPolyEarth2.mtl" />
      </div>
    </div>
  )
}

export default App
