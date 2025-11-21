import { Color3 } from '@babylonjs/core';
import type { EntityMarker } from '../components/EntityMarker';
import { loadRowsFromCSV } from './scvLoader';

interface entityCSVRow {
  id: string;
  type: string;
  latitude: string;
  longitude: string;
  name: string;
  colorR: string;
  colorG: string;
  colorB: string;
  size: string;
}

/**
 * Converts CSV row to EntityMarker object
 */
function csvRowToEntityMarker(row: entityCSVRow): EntityMarker {
  return {
    id: row.id,
    type: row.type as 'marker',
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    name: row.name,
    color: new Color3(
      parseFloat(row.colorR),
      parseFloat(row.colorG),
      parseFloat(row.colorB)
    ),
    size: parseFloat(row.size)
  };
}

/**
 * Loads entity markers from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise that resolves to an array of EntityMarker objects
 */
export async function loadEntitiesFromCSV(csvPath: string): Promise<EntityMarker[]> {
  try {
    const rows = await loadRowsFromCSV(csvPath);
    return rows.map(csvRowToEntityMarker);
  } catch (error) {
    console.error('Error loading entities from CSV:', error);
    return [];
  }
}
