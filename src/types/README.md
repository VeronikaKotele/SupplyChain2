# Types Directory Structure

This document describes the centralized type system for the SupplyChain2 project.

## Directory Structure

```
src/
  types/
    ├── index.ts          # Barrel export - import from here
    ├── data.ts           # Data models (Company, Connection, Transaction)
    └── filters.ts        # Filter-related types
```

## Files

### `data.ts`
Contains core data models used throughout the application:
- `Company` - Supply chain entity/company
- `Connection` - Flow/connection between entities
- `Transaction` - Transaction data
- `TransactionFilters` - Filter criteria for transactions
- `TransactionStats` - Computed statistics from transactions

### `filters.ts`
Contains all filter-related types:
- `DateRange` - Date range for time-based filtering
- `FilterState` - Current state of all filters
- `FilteredData` - Results after applying filters
- `FilterOptions` - Available options for each filter
- `FilterHandlers` - Callback handlers for filter interactions
- `OriginalDataSet` - Props for useFilters hook
- `UseFiltersReturn` - Return type from useFilters hook

### `index.ts`
Barrel export file that re-exports all types for convenient importing.

## Usage

### Recommended Import Pattern

```typescript
// Import from centralized types directory
import type { Transaction, FilterState, DateRange } from '../../types';

// Or with path alias (if configured)
import type { Transaction, FilterState, DateRange } from '@/types';
```

### Multiple Imports

```typescript
import type {
  Company,
  Connection,
  Transaction,
  FilterState,
  DateRange
} from '../../types';
```

## Migration Notes

### Files Updated

The following files were updated to use centralized types:

1. **Data Loaders**
   - `src/utils/dataLoad/transactionsLoader.ts`
   - `src/utils/dataLoad/entitiesLoader.ts`
   - `src/utils/dataLoad/connectionLoader.ts`

2. **Filter Components**
   - `src/components/filters/Filter.tsx`
   - `src/components/filters/useFilters.ts`
   - `src/components/filters/index.ts`
   - `src/components/filters/types.ts` (now re-exports for backward compatibility)

3. **Main App**
   - `src/App.tsx`

### Backward Compatibility

The old `src/components/filters/types.ts` file has been kept and now re-exports all types from the centralized location. This ensures any existing imports continue to work.

## Component-Scoped Types

The following types remain in their component directories as they are component-specific:

- `src/components/earthView/interfaces/CompanyMarker.ts`
- `src/components/earthView/interfaces/ConnectionMarker.ts`

These are visualization-specific types tightly coupled to the EarthViewer component.

## Benefits

1. **Single Source of Truth**: All shared types in one location
2. **Better Organization**: Clear separation between data models, filters, and component types
3. **Easier Imports**: Import from one location instead of multiple files
4. **Reduced Duplication**: Eliminates duplicate type definitions
5. **Improved Maintainability**: Easier to update and refactor types
6. **Better IDE Support**: Cleaner autocomplete and type hints

## Future Considerations

Consider adding these type files as the project grows:

- `api.ts` - API request/response types
- `ui.ts` - Common UI component prop types
- `global.d.ts` - Global ambient declarations
- `env.d.ts` - Environment variable types
