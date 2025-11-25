import React from 'react';
import type { TransactionStats } from '@app/types';
import './TransactionStatistics.css';

/**
 * Filters component - Centralized filtering UI for the supply chain visualization
 * Manages all filter controls including entity types, names, categories, time periods, and regions
 */
const TransactionStatistics: React.FC<{ stats: TransactionStats }> = ({ stats }) => {
  return (
    <div className="transaction-statistics">
      {/* Row 1: Total Transactions, Total Companies, Total Connections, Total Unique Products */}
      <div className="statistics-row-1">
        <div className="stat-item">
          <div className="stat-label">Total Transactions</div>
          <div className="stat-value">{stats.totalTransactions.toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Companies</div>
          <div className="stat-value">{stats.company_ids.toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Connections</div>
          <div className="stat-value">{stats.flow_ids.toLocaleString()}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Unique Products</div>
          <div className="stat-value">{stats.products.toLocaleString()}</div>
        </div>
      </div>

      {/* Row 2: Order vs Actual Quantity and Value */}
      <div className="statistics-row-2">
        <div className="stat-item">
          <div className="stat-label">Order Quantity vs Actual Quantity</div>
          <div className="stat-value">
            {stats.totalOrderQty.toLocaleString()} vs {stats.totalActualQty.toLocaleString()}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Order Value vs Actual Value</div>
          <div className="stat-value">
            ${(stats.totalOrderValue / 1000000).toFixed(2)}M vs ${(stats.totalActualValue / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionStatistics;