import { useState, useEffect } from 'react';
import type { ColorLegendOption, OriginalDataSet, UseFiltersReturn, DateRange, FilterState, FilterOptions } from '@app/types';
import { getFilterChangeHandlers } from './onFilterChangeHandlers';
import { computeFilteredData } from './computeFilteredData';
import { generateUniqueHexColorsInRange } from '@utils/colorsBlending';

/**
 * Custom hook that manages all filtering logic for the supply chain visualization
 * Provides centralized filter state management and computed filtered data
 */
export function useFilters({ 
  companies,
  connections,
  transactions
}: OriginalDataSet): UseFiltersReturn {
  // Filter state
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<Map<string, boolean>>(new Map());
  const [selectedCompanyNames, setSelectedCompanyNames] = useState<Map<string, boolean>>(new Map());
  const [selectedProductCategories, setSelectedProductCategories] = useState<Map<string, boolean>>(new Map());
  const [selectedTimeRange, setSelectedTimeRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [selectedSenderRegions, setSelectedSenderRegions] = useState<Map<string, boolean>>(new Map());
  const [selectedReceiverRegions, setSelectedReceiverRegions] = useState<Map<string, boolean>>(new Map());
  const filterState: FilterState = {
    selectedCompanyTypes,
    selectedCompanyNames,
    selectedProductCategories,
    selectedTimeRange,
    selectedSenderRegions,
    selectedReceiverRegions,
  };

  // Filter options
  const [companyTypeOptions, setCompanyTypeOptions] = useState<Array<ColorLegendOption>>([]);
  const [companyNameOptions, setCompanyNameOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const filterOptions: FilterOptions = {
    companyTypesLegend: companyTypeOptions,
    companyNames: companyNameOptions,
    productCategories: categoryOptions, 
    regions: regionOptions,
  };

  // When companies data loads
  useEffect(() => {
    if (companies.length > 0) {
      // Initialize company types filters
      const types = Array.from(new Set(companies.map(e => e.type)));
      const uniqueColors = generateUniqueHexColorsInRange(types.length, '#33D6FF', '#FF33A3');
      setCompanyTypeOptions(types.map((type, index) => ({ label: type, color: uniqueColors[index] })));
      setSelectedCompanyTypes(new Map(types.map(type => [type, true])));
      
      // Initialize company names filters
      const names = companies.map(e => e.name).sort();
      setCompanyNameOptions(names);
      setSelectedCompanyNames(new Map(names.map(name => [name, true])));
      
      // Initialize region filters
      const regions = companies.map(t => t.country);
      setRegionOptions(regions);
      setSelectedSenderRegions(new Map(regions.map(region => [region, true])));
      setSelectedReceiverRegions(new Map(regions.map(region => [region, true])));
    }
  }, [companies]);

  // When transactions data loads
  useEffect(() => {
    if (transactions.length > 0) {
      // Initialize category filters
      const categories = transactions.map(t => t.category);
      setCategoryOptions(categories);
      setSelectedProductCategories(new Map(categories.map(category => [category, true])));
    }
  }, [transactions]);

  // UseMemo handlers
  const handlers = getFilterChangeHandlers(
    setSelectedCompanyTypes,
    setSelectedCompanyNames,
    setSelectedProductCategories,
    setSelectedTimeRange,
    setSelectedSenderRegions,
    setSelectedReceiverRegions,
  );

  // UseMemo computes filtered data
  const filteredData = computeFilteredData(
    { companies, connections, transactions },
    filterState
  );

  return {
    filterState,
    filteredData,
    filterOptions,
    handlers,
  };
}
