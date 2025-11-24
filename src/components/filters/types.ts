import type { EntityMarker } from '../earthView/interfaces/EntityMarker';
import type { ConnectionMarker } from '../earthView/interfaces/ConnectionMarker';
import type { Transaction } from '../../utils/dataLoad/transactionsLoader';

export interface FilterState {
  entityTypes: Map<string, boolean>;
  selectedEntityNames: Set<string>;
  categories: Map<string, boolean>;
  timePeriods: Set<string>;
  senderRegions: Set<string>;
  receiverRegions: Set<string>;
}

export interface FilteredData {
  entities: EntityMarker[];
  connections: ConnectionMarker[];
  stats: {
    totalTransactions: number;
    company_ids: number;
    flow_ids: number;
    totalOrderQty: number;
    totalActualQty: number;
    totalOrderValue: number;
    totalActualValue: number;
  };
}

export interface FilterOptions {
  allEntityNames: string[];
  transactionCategories: string[];
  entityLegendItems: Array<{ label: string; color: string; enabled?: boolean }>;
  timePeriods: string[];
  senderRegions: string[];
  receiverRegions: string[];
}

export interface FilterHandlers {
  onEntityTypeToggle: (entityType: string) => void;
  onEntityTypeEnableAll: () => void;
  onEntityTypeDisableAll: () => void;
  onEntityNameToggle: (name: string) => void;
  onEntityNameEnableAll: () => void;
  onEntityNameDisableAll: () => void;
  onCategoryToggle: (category: string) => void;
  onCategoryEnableAll: () => void;
  onCategoryDisableAll: () => void;
  onTimePeriodToggle: (period: string) => void;
  onTimePeriodEnableAll: () => void;
  onTimePeriodDisableAll: () => void;
  onSenderRegionToggle: (region: string) => void;
  onSenderRegionEnableAll: () => void;
  onSenderRegionDisableAll: () => void;
  onReceiverRegionToggle: (region: string) => void;
  onReceiverRegionEnableAll: () => void;
  onReceiverRegionDisableAll: () => void;
}

export interface UseFiltersProps {
  allEntities: EntityMarker[];
  allConnections: ConnectionMarker[];
  transactions: Transaction[];
}

export interface UseFiltersReturn {
  filterState: FilterState;
  filteredData: FilteredData;
  filterOptions: FilterOptions;
  handlers: FilterHandlers;
}
