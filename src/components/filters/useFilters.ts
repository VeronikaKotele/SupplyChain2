import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UseFiltersProps, UseFiltersReturn } from './types';
import { getEntityLegendItems } from '../../utils/dataLoad/entitiesLoader';
import { getTransactionStats, getTransactionCategories, getFlowIdsForCategories } from '../../utils/dataLoad/transactionsLoader';

/**
 * Custom hook that manages all filtering logic for the supply chain visualization
 * Provides centralized filter state management and computed filtered data
 */
export function useFilters({ 
  allEntities, 
  allConnections, 
  transactions
}: UseFiltersProps): UseFiltersReturn {
  // Filter state
  const [entityTypeFilters, setEntityTypeFilters] = useState<Map<string, boolean>>(new Map());
  const [selectedEntityNames, setSelectedEntityNames] = useState<Set<string>>(new Set());
  const [categoryFilters, setCategoryFilters] = useState<Map<string, boolean>>(new Map());
  const [selectedTimePeriods, setSelectedTimePeriods] = useState<Set<string>>(new Set(["2020", "2021", "2022", "2023", "2024", "2025", "2026"]));
  const [selectedSenderRegions, setSelectedSenderRegions] = useState<Set<string>>(new Set(["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"]));
  const [selectedReceiverRegions, setSelectedReceiverRegions] = useState<Set<string>>(new Set(["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"]));
  
  const [transactionCategories, setTransactionCategories] = useState<string[]>([]);
  const [allEntityNames, setAllEntityNames] = useState<string[]>([]);
  const [transactionCategoriesJustLoaded, setTransactionCategoriesJustLoaded] = useState<boolean>(false);

  // Initialize filters when data loads
  useEffect(() => {
    if (allEntities.length > 0) {
      // Initialize entity type filters
      const types = new Set(allEntities.map(e => e.type));
      const filters = new Map<string, boolean>();
      types.forEach(type => filters.set(type || '', true));
      setEntityTypeFilters(filters);
      
      // Extract unique entity names
      const entityNames = Array.from(
        new Set(allEntities.map(e => e.name).filter((name): name is string => !!name && name.trim() !== ''))
      ).sort();
      setAllEntityNames(entityNames);
      setSelectedEntityNames(new Set(entityNames));
    }
  }, [allEntities]);

  // Initialize category filters when transactions load
  useEffect(() => {
    if (transactions.length > 0) {
      const categories = getTransactionCategories(transactions);
      setTransactionCategories(categories);
      setTransactionCategoriesJustLoaded(true);
      const filters = new Map<string, boolean>();
      categories.forEach(category => filters.set(category, true));
      setCategoryFilters(filters);
    }
  }, [transactions]);

  // Helper function to toggle with "select only this" behavior
  const createToggleHandler = useCallback((
    setter: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
  ) => (item: string) => {
    setter(prev => {
      const newFilters = new Map(prev);
      const allEnabled = Array.from(prev.values()).every(enabled => enabled);
      
      if (allEnabled) {
        // If all enabled, make only this one enabled
        newFilters.forEach((_, key) => newFilters.set(key, false));
        newFilters.set(item, true);
      } else {
        // Otherwise, toggle this one
        newFilters.set(item, !prev.get(item));
      }
      return newFilters;
    });
  }, []);

  // Handler functions
  const handlers = useMemo(() => ({
    // Entity Type handlers
    onEntityTypeToggle: createToggleHandler(setEntityTypeFilters),
    onEntityTypeEnableAll: () => {
      setEntityTypeFilters(prev => {
        const newFilters = new Map(prev);
        newFilters.forEach((_, key) => newFilters.set(key, true));
        return newFilters;
      });
    },
    onEntityTypeDisableAll: () => {
      setEntityTypeFilters(prev => {
        const newFilters = new Map(prev);
        newFilters.forEach((_, key) => newFilters.set(key, false));
        return newFilters;
      });
    },

    // Entity Name handlers
    onEntityNameToggle: (name: string) => {
      setSelectedEntityNames(prev => {
        const newSet = new Set(prev);
        const allSelected = prev.size === allEntityNames.length;
        
        if (allSelected) {
          return new Set([name]);
        } else {
          if (newSet.has(name)) {
            newSet.delete(name);
          } else {
            newSet.add(name);
          }
          return newSet;
        }
      });
    },
    onEntityNameEnableAll: () => setSelectedEntityNames(new Set(allEntityNames)),
    onEntityNameDisableAll: () => setSelectedEntityNames(new Set()),

    // Category handlers
    onCategoryToggle: createToggleHandler(setCategoryFilters),
    onCategoryEnableAll: () => {
      setCategoryFilters(prev => {
        const newFilters = new Map(prev);
        newFilters.forEach((_, key) => newFilters.set(key, true));
        return newFilters;
      });
    },
    onCategoryDisableAll: () => {
      setCategoryFilters(prev => {
        const newFilters = new Map(prev);
        newFilters.forEach((_, key) => newFilters.set(key, false));
        return newFilters;
      });
    },

    // Time Period handlers
    onTimePeriodToggle: (period: string) => {
      setSelectedTimePeriods(prev => {
        const newSet = new Set(prev);
        if (newSet.has(period)) {
          newSet.delete(period);
        } else {
          newSet.add(period);
        }
        return newSet;
      });
    },
    onTimePeriodEnableAll: () => setSelectedTimePeriods(new Set(["2020", "2021", "2022", "2023", "2024", "2025", "2026"])),
    onTimePeriodDisableAll: () => setSelectedTimePeriods(new Set()),

    // Sender Region handlers
    onSenderRegionToggle: (region: string) => {
      setSelectedSenderRegions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(region)) {
          newSet.delete(region);
        } else {
          newSet.add(region);
        }
        return newSet;
      });
    },
    onSenderRegionEnableAll: () => setSelectedSenderRegions(new Set(["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"])),
    onSenderRegionDisableAll: () => setSelectedSenderRegions(new Set()),

    // Receiver Region handlers
    onReceiverRegionToggle: (region: string) => {
      setSelectedReceiverRegions(prev => {
        const newSet = new Set(prev);
        if (newSet.has(region)) {
          newSet.delete(region);
        } else {
          newSet.add(region);
        }
        return newSet;
      });
    },
    onReceiverRegionEnableAll: () => setSelectedReceiverRegions(new Set(["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"])),
    onReceiverRegionDisableAll: () => setSelectedReceiverRegions(new Set()),
  }), [createToggleHandler, allEntityNames]);

  // Compute filtered entities and connections
  const filteredData = useMemo(() => {
    // Skip filtering if base data hasn't loaded
    if (allEntities.length === 0 || allConnections.length === 0) {
      return {
        entities: [],
        connections: [],
        stats: {
          totalTransactions: 0,
          company_ids: 0,
          flow_ids: 0,
          totalOrderQty: 0,
          totalActualQty: 0,
          totalOrderValue: 0,
          totalActualValue: 0,
        }
      };
    }

    // Skip if categories just loaded to avoid double-filtering
    if (transactionCategoriesJustLoaded) {
      setTransactionCategoriesJustLoaded(false);
      return {
        entities: allEntities,
        connections: allConnections,
        stats: {
          totalTransactions: 0,
          company_ids: 0,
          flow_ids: 0,
          totalOrderQty: 0,
          totalActualQty: 0,
          totalOrderValue: 0,
          totalActualValue: 0,
        }
      };
    }

    // Get enabled categories
    const enabledCategories = new Set<string>();
    categoryFilters.forEach((enabled, category) => {
      if (enabled) enabledCategories.add(category);
    });

    // Get flow IDs for enabled categories
    const allowedFlowIds = enabledCategories.size === categoryFilters.size || enabledCategories.size === 0
      ? null
      : getFlowIdsForCategories(transactions, enabledCategories);

    // Check if entity name filter is active
    const entityNameFilterActive = selectedEntityNames.size > 0 && selectedEntityNames.size < allEntityNames.length;

    // Get entity IDs used in transactions for enabled categories
    const categoryFilteredEntityIds = new Set<string>();
    if (allowedFlowIds) {
      allConnections.forEach(conn => {
        if (allowedFlowIds.has(conn.flow_id)) {
          categoryFilteredEntityIds.add(conn.id_from);
          categoryFilteredEntityIds.add(conn.id_to);
        }
      });
    }

    // Filter entities
    const filteredEntities = allEntities.filter(entity => {
      const typeEnabled = entityTypeFilters.get(entity.type || '') !== false;
      const categoryEnabled = !allowedFlowIds || categoryFilteredEntityIds.has(entity.id);
      const nameEnabled = !entityNameFilterActive || (entity.name && selectedEntityNames.has(entity.name));
      return typeEnabled && categoryEnabled && nameEnabled;
    });

    // Get IDs of filtered entities
    const filteredEntityIds = new Set(filteredEntities.map(e => e.id));

    // Filter connections: show where at least one entity is visible
    const filteredConnections = allConnections.filter(conn => {
      return filteredEntityIds.has(conn.id_from) || filteredEntityIds.has(conn.id_to);
    });

    // Calculate transaction stats
    const enabledEntityIds = new Set<string>();
    selectedEntityNames.forEach(entityName => {
      const entityInfo = allEntities.find(e => e.name === entityName);
      if (entityInfo?.id) {
        enabledEntityIds.add(entityInfo.id);
      }
    });

    const enabledEntityTypes = new Set<string>();
    entityTypeFilters.forEach((enabled, entityType) => {
      if (enabled) enabledEntityTypes.add(entityType);
    });

    const filters = {
      categories: enabledCategories.size < categoryFilters.size ? enabledCategories : undefined,
      company_ids: enabledEntityIds.size < allEntityNames.length ? enabledEntityIds : undefined,
      entity_types: enabledEntityTypes.size < entityTypeFilters.size ? enabledEntityTypes : undefined,
    };

    const stats = getTransactionStats(transactions, filters);

    return {
      entities: filteredEntities,
      connections: filteredConnections,
      stats: {
        totalTransactions: stats.totalTransactions,
        company_ids: stats.company_ids.length,
        flow_ids: stats.flow_ids.length,
        totalOrderQty: stats.totalOrderQty,
        totalActualQty: stats.totalActualQty,
        totalOrderValue: stats.totalOrderValue,
        totalActualValue: stats.totalActualValue,
      }
    };
  }, [
    allEntities,
    allConnections,
    transactions,
    entityTypeFilters,
    categoryFilters,
    selectedEntityNames,
    allEntityNames,
    transactionCategoriesJustLoaded,
    selectedTimePeriods,
    selectedSenderRegions,
    selectedReceiverRegions
  ]);

  // Prepare entity legend items with state
  const entityLegendItems = useMemo(() => {
    const items = getEntityLegendItems();
    return items.map(item => ({
      ...item,
      enabled: entityTypeFilters.get(item.label) !== false
    }));
  }, [entityTypeFilters]);

  return {
    filterState: {
      entityTypes: entityTypeFilters,
      selectedEntityNames,
      categories: categoryFilters,
      timePeriods: selectedTimePeriods,
      senderRegions: selectedSenderRegions,
      receiverRegions: selectedReceiverRegions,
    },
    filteredData,
    filterOptions: {
      allEntityNames,
      transactionCategories,
      entityLegendItems,
      timePeriods: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
      senderRegions: ["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"],
      receiverRegions: ["DE", "US", "CN", "IN", "FR", "GB", "JP", "KR", "BR", "CA"],
    },
    handlers,
  };
}
