import React from 'react';
import LegendFilter from './LegendFilter';
import DropdownFilter from './DropdownFilter';
import type { FilterOptions, FilterState, FilterHandlers } from './types';
import './Filters.css';

interface FilterProps {
  filterState: FilterState;
  filterOptions: FilterOptions;
  handlers: FilterHandlers;
}

/**
 * Filters component - Centralized filtering UI for the supply chain visualization
 * Manages all filter controls including entity types, names, categories, time periods, and regions
 */
const Filters: React.FC<FilterProps> = ({ filterState, filterOptions, handlers }) => {
  return (
    <div className="filters-container">
      {/* Company Type Filter */}
      <LegendFilter 
        title="Company Type" 
        items={filterOptions.entityLegendItems} 
        onToggle={handlers.onEntityTypeToggle}
        onEnableAll={handlers.onEntityTypeEnableAll}
        onDisableAll={handlers.onEntityTypeDisableAll}
      />

      {/* Company Names Filter */}
      <DropdownFilter
        title="Company Names"
        items={filterOptions.allEntityNames}
        selectedItems={filterState.selectedEntityNames}
        onToggle={handlers.onEntityNameToggle}
        onEnableAll={handlers.onEntityNameEnableAll}
        onDisableAll={handlers.onEntityNameDisableAll}
        placeholder="Search entity names..."
      />

      {/* Product Category Filter */}
      <DropdownFilter
        title="Product Category" 
        items={filterOptions.transactionCategories} 
        selectedItems={new Set(
          filterOptions.transactionCategories.filter(cat => 
            filterState.categories.get(cat) !== false
          )
        )}
        onToggle={handlers.onCategoryToggle}
        onEnableAll={handlers.onCategoryEnableAll}
        onDisableAll={handlers.onCategoryDisableAll}
        placeholder="Search categories..."
      />

      {/* Time Period Filter */}
      <DropdownFilter
        title="Time Period"
        items={filterOptions.timePeriods}
        selectedItems={filterState.timePeriods}
        onToggle={handlers.onTimePeriodToggle}
        onEnableAll={handlers.onTimePeriodEnableAll}
        onDisableAll={handlers.onTimePeriodDisableAll}
        placeholder="Search years..."
      />

      {/* Sender Region Filter */}
      <DropdownFilter
        title="Sender Region"
        items={filterOptions.senderRegions}
        selectedItems={filterState.senderRegions}
        onToggle={handlers.onSenderRegionToggle}
        onEnableAll={handlers.onSenderRegionEnableAll}
        onDisableAll={handlers.onSenderRegionDisableAll}
        placeholder="Search sender regions..."
      />

      {/* Receiver Region Filter */}
      <DropdownFilter
        title="Receiver Region"
        items={filterOptions.receiverRegions}
        selectedItems={filterState.receiverRegions}
        onToggle={handlers.onReceiverRegionToggle}
        onEnableAll={handlers.onReceiverRegionEnableAll}
        onDisableAll={handlers.onReceiverRegionDisableAll}
        placeholder="Search receiver regions..."
      />
    </div>
  );
};

export default Filters;
