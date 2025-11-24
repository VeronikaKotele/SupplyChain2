import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/earthView/EarthViewer'
import PowerBIDashboard from './components/dashboard/PowerBIDashboard'
import ErrorBoundary from './utils/ErrorBoundary'
import { Filters, useFilters } from './components/filters'
import type { EntityMarker } from './components/earthView/interfaces/EntityMarker'
import type { ConnectionMarker } from './components/earthView/interfaces/ConnectionMarker'
import type { Transaction } from './utils/dataLoad/transactionsLoader'
import { loadEntitiesFromCSV } from './utils/dataLoad/entitiesLoader'
import { loadConnectionsFromCSV } from './utils/dataLoad/connectionLoader'
import { loadTransactionsFromCSV } from './utils/dataLoad/transactionsLoader'

function App() {
  const [allEntities, setAllEntities] = useState<EntityMarker[]>([]);
  const [allConnections, setAllConnections] = useState<ConnectionMarker[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [maxAmount, setMaxAmount] = useState<number>(100);
  
  // Use the centralized filter hook
  const { filterState, filteredData, filterOptions, handlers } = useFilters({
    allEntities,
    allConnections,
    transactions
  });

  useEffect(() => {
    // Load entities from CSV
    loadEntitiesFromCSV('/entities.csv').then((loadedEntities) => {
      setAllEntities(loadedEntities);
    });
    
    // Load connections from CSV
    loadConnectionsFromCSV('/connections.csv').then((conns) => {
      setAllConnections(conns);
      
      // Calculate max amount for scaling
      if (conns.length > 0) {
        const max = Math.max(...conns.map(c => c.amount ?? 1));
        setMaxAmount(max);
      }
    });

    // Load transactions from CSV
    loadTransactionsFromCSV('/transactions.csv').then((loadedTransactions) => {
      setTransactions(loadedTransactions);
    });
  }, []);


  return (
    <div className="app-container">
      <header>
        <h1>Supply Chain Performance Visualization</h1>
      </header>
      <div className="content-container">
        <Filters 
          filterState={filterState}
          filterOptions={filterOptions}
          handlers={handlers}
        />
        <div className="dashboard-container">
          <ErrorBoundary
            backgroundImageUrl='/PowerBI_clean_dashboard.png'
            title='Failed to load Power BI Dashboard'
            message='Please check your embed URL configuration in the .env file'
          >
            <PowerBIDashboard
              embedUrl={import.meta.env.VITE_POWERBI_EMBED_URL}
            />
          </ErrorBoundary>
        </div>
        <div className="viewer-container">
          <div style={{ position: 'relative', width: '100%', height: '70%' }}>
            <EarthViewer 
              modelPath="/models/earth/Earth.obj" 
              materialPath="/models/earth/Earth.mtl"
              scale={0.00016}
              entities={filteredData.entities}
              allEntities={allEntities}
              connections={filteredData.connections}
              maxConnectionAmount={maxAmount}
              earthRadius={1}
            />
          </div>
          <div style={{ position: 'relative', width: '100%', height: '30%', padding: '20px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Total Transactions</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredData.stats.totalTransactions.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Total Companies</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredData.stats.company_ids.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Total Connections</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredData.stats.flow_ids.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Order Quantity</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredData.stats.totalOrderQty.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Actual Quantity</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{filteredData.stats.totalActualQty.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Order Value</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${(filteredData.stats.totalOrderValue / 1000000).toFixed(2)}M</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Actual Value</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${(filteredData.stats.totalActualValue / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
