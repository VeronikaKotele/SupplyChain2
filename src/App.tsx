import { useEffect, useState } from 'react'
import './App.css'
import EarthViewer from './components/earthView/EarthViewer'
import PowerBIDashboard from './components/dashboard/PowerBIDashboard'
import ErrorBoundary from './utils/ErrorBoundary'
import Filters from './components/filters/Filters'
import { useFilters } from './components/filters/useFilters'
import { getTransactionStats } from './components/statistics/computeStats'
import TransactionStatistics from './components/statistics/TransactionStatistics'
import type { Company, Connection, Transaction, TransactionStats } from './types'
import { loadCompanies, loadConnections, loadTransactions } from './utils/scvLoader'

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStats>(getTransactionStats([]));
  
  // Use the centralized filter hook
  const { filterState, filteredData, filterOptions, handlers } = useFilters(
    { companies, connections, transactions });

  // Load data on mount
  useEffect(() => {
    // Load entities from CSV
    loadCompanies('/entities.csv').then((loadedCompanies) => {
      setCompanies(loadedCompanies);
    });
    
    // Load connections from CSV
    loadConnections('/connections.csv').then((loadedConnections) => {
      setConnections(loadedConnections);
    });

    // Load transactions from CSV
    loadTransactions('/transactions.csv').then((loadedTransactions) => {
      setTransactions(loadedTransactions);
    });
  }, []);

  // Update statistics when filtered transactions change
  useEffect(() => {
    const stats = getTransactionStats(filteredData.transactions);
    setStatistics(stats);
  }, [filteredData.transactions]);

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
        <div className="viewer-add-stats-container">
          <div className="viewer-container">
            <EarthViewer 
              earthModelProps={{
                modelPath: "/models/earth/Earth.obj",
                materialPath: "/models/earth/Earth.mtl",
                radius: 1,
                applyScale: 0.00016,
                modelOrientationLongitudeOffset: 180
              }}
              companies={filteredData.companies}
              connections={filteredData.connections}
              companyTypeColors={filterOptions.companyTypesLegend}
            />
          </div>
        </div>
        <div className="stats-container">
          <TransactionStatistics stats={statistics} />
        </div>
      </div>
    </div>
  )
}

export default App
