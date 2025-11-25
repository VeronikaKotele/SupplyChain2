import { useMemo, useCallback } from 'react';
import type { FilterHandlers, DateRange } from '@app/types';

/**
 * Custom hook that manages all filtering logic for the supply chain visualization
 * Provides centralized filter state management and computed filtered data
 */
export function getFilterChangeHandlers(
  setSelectedCompanyTypes: React.Dispatch<React.SetStateAction<Map<string, boolean>>>,
  setSelectedCompanyNames: React.Dispatch<React.SetStateAction<Map<string, boolean>>>,
  setSelectedProductCategories: React.Dispatch<React.SetStateAction<Map<string, boolean>>>,
  setSelectedTimeRange: React.Dispatch<React.SetStateAction<DateRange>>,
  setSelectedSenderRegions: React.Dispatch<React.SetStateAction<Map<string, boolean>>>,
  setSelectedReceiverRegions: React.Dispatch<React.SetStateAction<Map<string, boolean>>>,
): FilterHandlers {
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

  const createEnableAllHandler = useCallback((
    setter: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
  ) => () => {
    setter(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, true));
      return newFilters;
    });
  }, []);

  const createDisableAllHandler = useCallback((
    setter: React.Dispatch<React.SetStateAction<Map<string, boolean>>>
  ) => () => {
    setter(prev => {
      const newFilters = new Map(prev);
      newFilters.forEach((_, key) => newFilters.set(key, false));
      return newFilters;
    });
  }, []);

  // Handler functions
  const handlers = useMemo(() => ({
    // Company Type handlers
    onCompanyTypeToggle: createToggleHandler(setSelectedCompanyTypes),
    onCompanyTypeEnableAll: createEnableAllHandler(setSelectedCompanyTypes),
    onCompanyTypeDisableAll: createDisableAllHandler(setSelectedCompanyTypes),

    // Company Name handlers
    onCompanyNameToggle: createToggleHandler(setSelectedCompanyNames),
    onCompanyNameEnableAll: createEnableAllHandler(setSelectedCompanyNames),
    onCompanyNameDisableAll: createDisableAllHandler(setSelectedCompanyNames),

    // Category handlers
    onCategoryToggle: createToggleHandler(setSelectedProductCategories),
    onCategoryEnableAll: createEnableAllHandler(setSelectedProductCategories),
    onCategoryDisableAll: createDisableAllHandler(setSelectedProductCategories),

    // Time Period handlers
    onTimeRangeChange: (dates: [Date | null, Date | null]) => {
      setSelectedTimeRange({ startDate: dates[0], endDate: dates[1] });
    },

    // Sender Region handlers
    onSenderRegionToggle: createToggleHandler(setSelectedSenderRegions),
    onSenderRegionEnableAll: createEnableAllHandler(setSelectedSenderRegions),
    onSenderRegionDisableAll: createDisableAllHandler(setSelectedSenderRegions),

    // Receiver Region handlers
    onReceiverRegionToggle: createToggleHandler(setSelectedReceiverRegions),
    onReceiverRegionEnableAll: createEnableAllHandler(setSelectedReceiverRegions),
    onReceiverRegionDisableAll: createDisableAllHandler(setSelectedReceiverRegions),
  }), [createToggleHandler, createEnableAllHandler, createDisableAllHandler]);

  return handlers;
}