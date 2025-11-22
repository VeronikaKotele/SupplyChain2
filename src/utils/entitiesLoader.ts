import { Color3 } from '@babylonjs/core';
import type { EntityMarker } from '../components/EntityMarker';
import { loadRowsFromCSV } from './scvLoader';

interface entityCSVRow {
  id: string;
  type: string;
  name: string;
  country: string;
  lat: string;
  lon: string;
}

const colors = new Map<string, Color3>([
  ['Market Affiliate', new Color3(0.0, 0.318, 0.612)],      // Beiersdorf Blue #005199
  ['Customer', new Color3(0.0, 0.667, 0.784)],              // Light Blue #00AAC8
  ['Supplier', new Color3(0.4, 0.6, 0.8)],                  // Sky Blue
  ['Production Center', new Color3(0.937, 0.608, 0.0)],     // Orange #EF9B00
  ['Distribution Center', new Color3(0.0, 0.502, 0.478)],   // Teal #00807A
]);

const defaultSize = 0.05;

/**
 * Converts Color3 to CSS hex color string
 */
function color3ToHex(color: Color3): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Gets entity color legend items for UI display
 */
export function getEntityLegendItems(): Array<{ label: string; color: string }> {
  return Array.from(colors.entries()).map(([label, color]) => ({
    label,
    color: color3ToHex(color)
  }));
}

/**
 * Converts CSV row to EntityMarker object
 */
function csvRowToEntityMarker(row: entityCSVRow): EntityMarker {
  return {
    id: row.id,
    type: row.type,
    latitude: parseFloat(row.lat),
    longitude: parseFloat(row.lon),
    name: row.name,
    color: colors.get(row.type) || new Color3(1, 1, 1),
    size: defaultSize
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
