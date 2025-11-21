import { Color3 } from '@babylonjs/core';
import type { LocationMarker } from '../components/LocationMarker';
import { loadRowsFromCSV } from './scvLoader';

interface LocationCSVRow {
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
 * Converts CSV row to LocationMarker object
 */
function csvRowToLocationMarker(row: LocationCSVRow): LocationMarker {
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
 * Loads location markers from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise that resolves to an array of LocationMarker objects
 */
export async function loadLocationsFromCSV(csvPath: string): Promise<LocationMarker[]> {
  try {
    const rows = await loadRowsFromCSV(csvPath);
    return rows.map(csvRowToLocationMarker);
  } catch (error) {
    console.error('Error loading locations from CSV:', error);
    return [];
  }
}
