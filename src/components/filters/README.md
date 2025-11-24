# Filters Architecture Documentation

## Overview

The filtering system has been refactored into a modular, maintainable architecture that separates concerns and improves performance. All filter-related logic is now centralized in the `./components/filters/` directory.

## Architecture

### Components

#### 1. **Filters.tsx** (Main Component)
The primary UI component that renders all filter controls.

**Props:**
- `filterState`: Current state of all filters
- `filterOptions`: Available options for each filter (categories, entity names, etc.)
- `handlers`: Callback functions for filter interactions

**Responsibility:**
- Renders the filter UI using `LegendFilter` and `DropdownFilter` subcomponents
- Delegates state management to parent via props
- Purely presentational component

#### 2. **useFilters.ts** (Custom Hook)
Core filtering logic encapsulated in a reusable React hook.

**Input (UseFiltersProps):**
- `allEntities`: Complete list of entity markers
- `allConnections`: Complete list of connection markers
- `transactions`: Complete list of transactions

**Output (UseFiltersReturn):**
- `filterState`: Current filter selections
- `filteredData`: Computed filtered entities, connections, and statistics
- `filterOptions`: Available filter options
- `handlers`: Event handler functions for filter interactions

**Key Features:**
- **Memoized Filtering**: Uses `useMemo` to avoid unnecessary recalculations
- **Centralized State**: All filter states managed in one place
- **Computed Statistics**: Automatically calculates transaction stats based on active filters
- **Performance Optimized**: Filters are only recomputed when dependencies change

#### 3. **types.ts**
TypeScript type definitions for the entire filter system.

**Key Interfaces:**
- `FilterState`: Represents current filter selections
- `FilteredData`: Structure of filtered output data
- `FilterOptions`: Available options for each filter
- `FilterHandlers`: Callback function signatures
- `UseFiltersProps` & `UseFiltersReturn`: Hook interface

#### 4. **LegendFilter.tsx** & **DropdownFilter.tsx**
Reusable UI components for different filter types (unchanged from original).

### Data Flow

```
App.tsx
  │
  ├─> Loads base data (entities, connections, transactions)
  │
  ├─> useFilters Hook
  │     │
  │     ├─> Manages filter state
  │     ├─> Computes filtered data
  │     └─> Provides handlers
  │
  ├─> Filters Component (receives state, options, handlers)
  │     │
  │     ├─> LegendFilter (Company Types)
  │     ├─> DropdownFilter (Company Names)
  │     ├─> DropdownFilter (Product Category)
  │     ├─> DropdownFilter (Time Period)
  │     ├─> DropdownFilter (Sender Region)
  │     └─> DropdownFilter (Receiver Region)
  │
  └─> Uses filteredData for EarthViewer and Statistics
```

## Filters Logic

### Entity Filtering
Entities are filtered based on:
1. **Entity Type**: Filtered by company type (Market Affiliate, Customer, Supplier, etc.)
2. **Entity Name**: Filtered by specific company names
3. **Category**: Only shows entities involved in transactions of selected categories

### Connection Filtering
Connections are shown when:
- At least one connected entity (source or destination) passes the entity filters
- The connection's flow_id is associated with selected product categories

### Transaction Statistics
Stats are computed from filtered transactions based on:
- Selected product categories
- Selected entity names
- Selected entity types

Statistics include:
- Total transactions count
- Unique company IDs
- Unique flow IDs
- Order quantities (ordered vs actual)
- Order values (ordered vs actual)

## Performance Considerations

### Optimizations Implemented

1. **Memoization**
   - `useMemo` for filtered data computation
   - `useMemo` for handler function creation
   - `useCallback` for toggle handler factory

2. **Efficient Re-renders**
   - Filters component only re-renders when props change
   - Statistics computed once per filter change, not per render

3. **Smart Filtering**
   - Early returns when base data hasn't loaded
   - Skips filtering on initial category load to prevent double-filtering
   - Uses Sets for O(1) lookups instead of arrays

4. **Dependency Management**
   - Hook dependencies carefully selected to avoid unnecessary recalculations
   - Filters state changes trigger single recalculation of all filtered data

### Scaling Considerations

The current architecture supports:
- **Large datasets**: Filtering operations are O(n) where n is the number of items
- **Multiple filters**: All filters are applied in a single pass
- **Real-time updates**: Hook-based architecture supports live data updates

## Usage Example

```tsx
import { Filters, useFilters } from './components/filters';

function App() {
  const [allEntities, setAllEntities] = useState([]);
  const [allConnections, setAllConnections] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Use the filter hook
  const { filterState, filteredData, filterOptions, handlers } = useFilters({
    allEntities,
    allConnections,
    transactions
  });

  return (
    <div>
      {/* Render filters */}
      <Filters 
        filterState={filterState}
        filterOptions={filterOptions}
        handlers={handlers}
      />
      
      {/* Use filtered data */}
      <EarthViewer 
        entities={filteredData.entities}
        connections={filteredData.connections}
      />
      
      {/* Display statistics */}
      <Statistics stats={filteredData.stats} />
    </div>
  );
}
```

## Benefits of New Architecture

### 1. **Separation of Concerns**
- UI logic separated from business logic
- Filters state management isolated from presentation
- Data loading separated from filtering

### 2. **Maintainability**
- Filters logic centralized in one place
- Easy to add new filters (just extend types and hook)
- Type-safe interfaces prevent errors

### 3. **Testability**
- Hook can be tested independently
- Filters component can be tested with mock props
- Clear input/output contracts

### 4. **Reusability**
- `useFilters` hook can be used in other components
- Filters UI components are fully reusable
- Type definitions shared across codebase

### 5. **Performance**
- Reduced re-renders through memoization
- Single-pass filtering operations
- Optimized dependency tracking

## Future Enhancements

Potential improvements to consider:

1. **Persistence**: Save filter state to localStorage or URL params
2. **Presets**: Allow users to save/load filter configurations
3. **Advanced Filters**: Add date range, numeric range filters
4. **Filters Analytics**: Track which filters are used most
5. **Virtual Scrolling**: For very large dropdown lists
6. **Debouncing**: For search inputs in dropdown filters
7. **Filters Relationships**: Show how filters affect each other (e.g., available options change based on other selections)

## Migration Notes

### Changes from Original Code

**Removed from App.tsx:**
- ~200 lines of filter state management
- All filter handler functions
- Manual filter computation logic
- Transaction stats calculation inline

**Added to App.tsx:**
- Single `useFilters` hook call
- `Filters` component usage
- Cleaner, more readable code

**File Size Reduction:**
- App.tsx: ~370 lines → ~126 lines (66% reduction)

### Breaking Changes
None - the API remains compatible with the rest of the application.

## Troubleshooting

### Filters not updating
- Verify that `allEntities`, `allConnections`, and `transactions` are being passed correctly to `useFilters`
- Check that filter handlers are connected to the Filters component

### Performance issues
- Check React DevTools for unnecessary re-renders
- Verify that filter options arrays are stable (not recreated each render)
- Consider adding debouncing to search inputs

### Statistics incorrect
- Ensure transaction data includes all required fields
- Check that entity IDs match between entities and transactions
- Verify flow_id format in connections data
