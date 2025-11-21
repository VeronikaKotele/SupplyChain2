import { Color3 } from '@babylonjs/core';
import type { LocationMarker } from '../components/EarthViewer';

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
 * Parses a CSV string into an array of objects
 */
function parseCSV(csvText: string): LocationCSVRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as LocationCSVRow;
  });
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
    const response = await fetch(csvPath);
    
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    return rows.map(csvRowToLocationMarker);
  } catch (error) {
    console.error('Error loading locations from CSV:', error);
    return [];
  }
}
