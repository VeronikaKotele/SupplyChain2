import type { Company, Connection, Transaction } from './data';

/**
 * Represents a date range filter for transactions
 * Uses Date objects for react-datepicker compatibility
 */
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Current state of all active filters
 */
export interface FilterState {
  selectedCompanyTypes: Map<string, boolean>;
  selectedCompanyNames: Map<string, boolean>;
  selectedProductCategories: Map<string, boolean>;
  selectedTimeRange: DateRange;
  selectedSenderRegions: Map<string, boolean>;
  selectedReceiverRegions: Map<string, boolean>;
}

/**
 * Available options for each filter
 */
export interface FilterOptions {
  companyTypesLegend: Array<{ label: string; color: string; enabled?: boolean }>;
  companyNames: string[];
  productCategories: string[]; 
  regions: string[];
}

/**
 * Callback handlers for filter interactions
 */
export interface FilterHandlers {
  onCompanyTypeToggle: (entityType: string) => void;
  onCompanyTypeEnableAll: () => void;
  onCompanyTypeDisableAll: () => void;
  onCompanyNameToggle: (name: string) => void;
  onCompanyNameEnableAll: () => void;
  onCompanyNameDisableAll: () => void;
  onCategoryToggle: (category: string) => void;
  onCategoryEnableAll: () => void;
  onCategoryDisableAll: () => void;
  onTimeRangeChange: (dates: [Date | null, Date | null]) => void;
  onSenderRegionToggle: (region: string) => void;
  onSenderRegionEnableAll: () => void;
  onSenderRegionDisableAll: () => void;
  onReceiverRegionToggle: (region: string) => void;
  onReceiverRegionEnableAll: () => void;
  onReceiverRegionDisableAll: () => void;
}

/**
 * IDs of filtered entities after applying filters
 */
export interface FilteredData {
  companies: Company[];
  connections: Connection[];
  transactions: Transaction[];
}

/**
 * Props for the useFilters hook
 */
export interface OriginalDataSet {
  companies: Company[];
  connections: Connection[];
  transactions: Transaction[];
}

/**
 * Return value from the useFilters hook
 */
export interface UseFiltersReturn {
  filterState: FilterState;
  filterOptions: FilterOptions;
  handlers: FilterHandlers;
  filteredData: FilteredData;
}

export interface ColorLegendOption {
  label: string;
  color: string; // Hex color code representing the company type
  enabled?: boolean;
}
