import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/EarthViewer'
import PowerBIDashboard from './components/PowerBIDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import LegendFilter from './components/LegendFilter'
import type { EntityMarker } from './components/EntityMarker'
import type { ConnectionMarker } from './components/ConnectionMarker'
import { loadEntitiesFromCSV, getEntityLegendItems } from './utils/entitiesLoader'
import { loadConnectionsFromCSV, getConnectionLegendItems } from './utils/connectionLoader'

function App() {
  const [entities, setEntities] = useState<EntityMarker[]>([]);
  const [connections, setConnections] = useState<ConnectionMarker[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(100);
  
  const [allEntities, setAllEntities] = useState<EntityMarker[]>([]);
  const [allConnections, setAllConnections] = useState<ConnectionMarker[]>([]);
  
  const [entityFilters, setEntityFilters] = useState<Map<string, boolean>>(new Map());
  const [connectionFilters, setConnectionFilters] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    // Load entities and connections from CSV files
    loadEntitiesFromCSV('/data/entities.csv').then((loadedEntities) => {
      setAllEntities(loadedEntities);
      setEntities(loadedEntities);
      
      // Initialize all entity types as enabled
      const types = new Set(loadedEntities.map(e => e.type));
      const filters = new Map<string, boolean>();
      types.forEach(type => filters.set(type || '', true));
      setEntityFilters(filters);
    });
    
    loadConnectionsFromCSV('/data/connections.csv').then((conns) => {
      setAllConnections(conns);
      setConnections(conns);
      
      // Calculate max amount for scaling
      if (conns.length > 0) {
        const max = Math.max(...conns.map(c => c.amount ?? 1));
        setMaxAmount(max);
      }
      
      // Initialize all connection types as enabled
      const stepTypes = new Set(conns.map(c => c.step_type));
      const filters = new Map<string, boolean>();
      stepTypes.forEach(type => filters.set(type, true));
      setConnectionFilters(filters);
    });
  }, []);

  // Filter entities and connections when filters change
  useEffect(() => {
    // First, filter connections based on connection filters
    const filteredConnections = allConnections.filter(conn => 
      connectionFilters.get(conn.step_type) !== false
    );
    setConnections(filteredConnections);

    // Get all entity IDs that are used by enabled connections
    const usedEntityIds = new Set<string>();
    filteredConnections.forEach(conn => {
      usedEntityIds.add(conn.id_from);
      usedEntityIds.add(conn.id_to);
    });

    // Filter entities: show if entity type is enabled OR if entity is used by enabled connections
    const filteredEntities = allEntities.filter(entity => {
      const typeEnabled = entityFilters.get(entity.type || '') !== false;
      const usedByConnection = usedEntityIds.has(entity.id);
      return typeEnabled && (usedByConnection || filteredConnections.length === allConnections.length);
    });
    setEntities(filteredEntities);
  }, [entityFilters, connectionFilters, allEntities, allConnections]);

  const handleEntityToggle = (index: number) => {
    // Find the original type name from the loader
    const entityTypes = Array.from(new Set(allEntities.map(e => e.type)));
    const originalType = entityTypes[index];
    
    setEntityFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.set(originalType || '', !prev.get(originalType || ''));
      return newFilters;
    });
  };

  const handleConnectionToggle = (index: number) => {
    // Find the original step_type from connections
    const stepTypes = Array.from(new Set(allConnections.map(c => c.step_type)));
    const originalType = stepTypes[index];
    
    setConnectionFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.set(originalType, !prev.get(originalType));
      return newFilters;
    });
  };

  const getEntityLegendItemsWithState = () => {
    const items = getEntityLegendItems();
    const entityTypes = Array.from(new Set(allEntities.map(e => e.type)));
    return items.map((item, index) => ({
      ...item,
      enabled: entityFilters.get(entityTypes[index] || '') !== false
    }));
  };

  const getConnectionLegendItemsWithState = () => {
    const items = getConnectionLegendItems();
    const stepTypes = Array.from(new Set(allConnections.map(c => c.step_type)));
    return items.map((item, index) => ({
      ...item,
      enabled: connectionFilters.get(stepTypes[index]) !== false
    }));
  };

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
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <EarthViewer 
              modelPath="/models/earth/Earth.obj" 
              materialPath="/models/earth/Earth.mtl"
              scale={0.00016}
              entities={entities}
              connections={connections}
              maxConnectionAmount={maxAmount}
              earthRadius={1} // Adjust if markers don't align with model surface
            />
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <LegendFilter 
                title="Entities" 
                items={getEntityLegendItemsWithState()} 
                onToggle={handleEntityToggle}
              />
              <LegendFilter 
                title="Connections" 
                items={getConnectionLegendItemsWithState()} 
                onToggle={handleConnectionToggle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
