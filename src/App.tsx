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
import { loadTransactionsFromCSV, getTransactionStats, getTransactionCategories, getFlowIdsForCategories, type Transaction } from './utils/transactionsLoader'

function App() {
  const [entities, setEntities] = useState<EntityMarker[]>([]);
  const [connections, setConnections] = useState<ConnectionMarker[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(100);
  
  const [allEntities, setAllEntities] = useState<EntityMarker[]>([]);
  const [allConnections, setAllConnections] = useState<ConnectionMarker[]>([]);
  
  const [entityFilters, setEntityFilters] = useState<Map<string, boolean>>(new Map());
  const [connectionFilters, setConnectionFilters] = useState<Map<string, boolean>>(new Map());

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<Map<string, boolean>>(new Map());
  const [transactionCategories, setTransactionCategories] = useState<string[]>([]);
  const [transactionCategoriesJustLoaded, setTransactionCategoriesJustLoaded] = useState<boolean>(false);
  const [flowIdFilter, setFlowIdFilter] = useState<string>('');
  const [entityNameFilter, setEntityNameFilter] = useState<string>('');

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

    // Load transactions
    loadTransactionsFromCSV('/data/transactions.csv').then((loadedTransactions) => {
      setTransactions(loadedTransactions);
      console.log('Transactions loaded:', loadedTransactions.length);
      console.log('Transaction stats:', getTransactionStats(loadedTransactions));
      
      // Initialize category filters
      const categories = getTransactionCategories(loadedTransactions);
      setTransactionCategories(categories);
      setTransactionCategoriesJustLoaded(true);
      const filters = new Map<string, boolean>();
      categories.forEach(category => filters.set(category, true));
      setCategoryFilters(filters);
    });
  }, []);

  // Filter entities and connections when filters change
  useEffect(() => {
    // Skip if we don't have all the base data loaded yet
    if (allEntities.length === 0 || allConnections.length === 0) return;

    if (transactionCategoriesJustLoaded) {
      // Just initialized category filters, skip filtering this time
      setTransactionCategoriesJustLoaded(false);
      return;
    }

    // Get enabled categories
    const enabledCategories = new Set<string>();
    categoryFilters.forEach((enabled, category) => {
      if (enabled) enabledCategories.add(category);
    });

    // Get flow IDs for enabled categories
    const allowedFlowIds = enabledCategories.size === categoryFilters.size || enabledCategories.size === 0
      ? null // If all categories enabled or none loaded yet, don't filter by flow ID
      : getFlowIdsForCategories(transactions, enabledCategories);

    // Check if flow ID filter is active
    const flowIdFilterActive = flowIdFilter.trim().length > 0;
    const entityNameFilterActive = entityNameFilter.trim().length > 0;

    // Filter connections based on connection type filters, category filters, and flow ID filter
    const filteredConnections = allConnections.filter(conn => {
      const typeEnabled = connectionFilters.get(conn.step_type) !== false;
      // If category filter is active, check if connection's flow_id is in allowed flow IDs
      const categoryEnabled = !allowedFlowIds || allowedFlowIds.has(conn.flow_id);
      // If flow ID filter is active, check if connection's flow_id contains the filter text
      const flowIdEnabled = !flowIdFilterActive || conn.flow_id.toLowerCase().includes(flowIdFilter.toLowerCase());
      return typeEnabled && categoryEnabled && flowIdEnabled;
    });
    setConnections(filteredConnections);

    // Get all entity IDs that are used in transactions for enabled categories
    const categoryFilteredEntityIds = new Set<string>();
    if (allowedFlowIds) {
      // If category filter is active, find entities connected to allowed flow IDs
      allConnections.forEach(conn => {
        if (allowedFlowIds.has(conn.flow_id)) {
          categoryFilteredEntityIds.add(conn.id_from);
          categoryFilteredEntityIds.add(conn.id_to);
        }
      });
    }

    // Get all entity IDs that are used by flow ID filtered connections
    const flowIdFilteredEntityIds = new Set<string>();
    if (flowIdFilterActive) {
      filteredConnections.forEach(conn => {
        flowIdFilteredEntityIds.add(conn.id_from);
        flowIdFilteredEntityIds.add(conn.id_to);
      });
    }

    // Filter entities based on entity type filters, category filters, flow ID filter, and name filter
    const filteredEntities = allEntities.filter(entity => {
      const typeEnabled = entityFilters.get(entity.type || '') !== false;
      // If category filter is active, entity must be in category-filtered set
      const categoryEnabled = !allowedFlowIds || categoryFilteredEntityIds.has(entity.id);
      // If flow ID filter is active, entity must be in flow ID filtered set
      const flowIdEnabled = !flowIdFilterActive || flowIdFilteredEntityIds.has(entity.id);
      // If entity name filter is active, check if entity name contains the filter text
      const nameEnabled = !entityNameFilterActive || (entity.name && entity.name.toLowerCase().includes(entityNameFilter.toLowerCase()));
      return typeEnabled && categoryEnabled && flowIdEnabled && nameEnabled;
    });
    setEntities(filteredEntities);
  }, [entityFilters, connectionFilters, categoryFilters, flowIdFilter, entityNameFilter, allEntities, allConnections, transactions]);

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

  const handleEntityEnableAll = () => {
    setEntityFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, true));
      return newFilters;
    });
  };

  const handleEntityDisableAll = () => {
    setEntityFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, false));
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

  const handleConnectionEnableAll = () => {
    setConnectionFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, true));
      return newFilters;
    });
  };

  const handleConnectionDisableAll = () => {
    setConnectionFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, false));
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

  const handleCategoryToggle = (index: number) => {
    const category = transactionCategories[index];
    
    setCategoryFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.set(category, !prev.get(category));
      return newFilters;
    });
  };

  const handleCategoryEnableAll = () => {
    setCategoryFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, true));
      return newFilters;
    });
  };

  const handleCategoryDisableAll = () => {
    setCategoryFilters(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, false));
      return newFilters;
    });
  };

  const getCategoryLegendItemsWithState = () => {
    return transactionCategories.map(category => ({
      label: category,
      color: '#999999', // Gray color for categories
      enabled: categoryFilters.get(category) !== false
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
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  padding: '16px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  minWidth: '200px',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Entity Name Filter
                </h3>
                <input
                  type="text"
                  value={entityNameFilter}
                  onChange={(e) => setEntityNameFilter(e.target.value)}
                  placeholder="Enter Entity Name..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  padding: '16px',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  minWidth: '200px',
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Flow ID Filter
                </h3>
                <input
                  type="text"
                  value={flowIdFilter}
                  onChange={(e) => setFlowIdFilter(e.target.value)}
                  placeholder="Enter Flow ID..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <LegendFilter 
                title="Entities" 
                items={getEntityLegendItemsWithState()} 
                onToggle={handleEntityToggle}
                onEnableAll={handleEntityEnableAll}
                onDisableAll={handleEntityDisableAll}
              />
              <LegendFilter 
                title="Connections" 
                items={getConnectionLegendItemsWithState()} 
                onToggle={handleConnectionToggle}
                onEnableAll={handleConnectionEnableAll}
                onDisableAll={handleConnectionDisableAll}
              />
              <LegendFilter 
                title="Categories" 
                items={getCategoryLegendItemsWithState()} 
                onToggle={handleCategoryToggle}
                onEnableAll={handleCategoryEnableAll}
                onDisableAll={handleCategoryDisableAll}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
