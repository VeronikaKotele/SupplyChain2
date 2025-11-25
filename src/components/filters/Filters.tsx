import React from 'react';
import LegendFilter from './LegendFilter';
import DropdownFilter from './DropdownFilter';
import './Filters.css';
import { DatePicker } from 'react-datepicker';
import type { FilterOptions, FilterState, FilterHandlers } from '@app/types';

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
        items={filterOptions.companyTypesLegend}
        selectedItems={filterState.selectedCompanyTypes}
        onToggle={handlers.onCompanyTypeToggle}
        onEnableAll={handlers.onCompanyTypeEnableAll}
        onDisableAll={handlers.onCompanyTypeDisableAll}
      />

      {/* Company Names Filter */}
      <DropdownFilter
        title="Company Names"
        items={filterOptions.companyNames}
        selectedItems={filterState.selectedCompanyNames}
        onToggle={handlers.onCompanyNameToggle}
        onEnableAll={handlers.onCompanyNameEnableAll}
        onDisableAll={handlers.onCompanyNameDisableAll}
        placeholder="Search entity names..."
      />

      {/* Product Category Filter */}
      <DropdownFilter
        title="Product Category" 
        items={filterOptions.productCategories} 
        selectedItems={filterState.selectedProductCategories}
        onToggle={handlers.onCategoryToggle}
        onEnableAll={handlers.onCategoryEnableAll}
        onDisableAll={handlers.onCategoryDisableAll}
        placeholder="Search categories..."
      />

      {/* Time Period Filter */}
      <DatePicker
        selectsRange
        startDate={filterState.selectedTimeRange.startDate}
        endDate={filterState.selectedTimeRange.endDate}
        onChange={handlers.onTimeRangeChange}
        isClearable={true}
        placeholderText="Select time range"
      />

      {/* Sender Region Filter */}
      <DropdownFilter
        title="Sender Region"
        items={filterOptions.regions}
        selectedItems={filterState.selectedSenderRegions}
        onToggle={handlers.onSenderRegionToggle}
        onEnableAll={handlers.onSenderRegionEnableAll}
        onDisableAll={handlers.onSenderRegionDisableAll}
        placeholder="Search sender regions..."
      />

      {/* Receiver Region Filter */}
      <DropdownFilter
        title="Receiver Region"
        items={filterOptions.regions}
        selectedItems={filterState.selectedReceiverRegions}
        onToggle={handlers.onReceiverRegionToggle}
        onEnableAll={handlers.onReceiverRegionEnableAll}
        onDisableAll={handlers.onReceiverRegionDisableAll}
        placeholder="Search receiver regions..."
      />
    </div>
  );
};

export default Filters;
