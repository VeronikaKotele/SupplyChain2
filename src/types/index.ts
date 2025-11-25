/**
 * Centralized type definitions for the Supply Chain application
 * 
 * This barrel file exports all types from the types directory,
 * allowing for clean imports throughout the application:
 * 
 * @example
 * import type { Transaction, FilterState, DateRange } from '@/types';
 */

// Data models
export type {
  Company,
  Connection,
  Transaction,
} from './data';

// Filter types
export type {
  DateRange,
  FilterState,
  FilteredData,
  FilterOptions,
  FilterHandlers,
  OriginalDataSet,
  UseFiltersReturn,
  ColorLegendOption,
} from './filters';

export type {
  TransactionStats,
} from './statistics';