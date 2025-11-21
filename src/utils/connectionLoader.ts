import { Color3 } from '@babylonjs/core';
import type { ConnectionMarker } from '../components/ConnectionMarker';
import { loadRowsFromCSV } from './scvLoader';

interface ConnectionCSVRow {
  Flow_Id: string;
  Id_From: string;
  Id_To: string;
  step_type: string;
  // product: string;
  // amount: string;
}

const colors = new Map<string, Color3>([
  ['supplier', new Color3(0.0, 0.159, 0.306)],      // Dark Beiersdorf Blue #002850
  ['internal_1', new Color3(0.0, 0.333, 0.392)],    // Dark Light Blue #005564
  ['internal_2', new Color3(0.2, 0.3, 0.4)],        // Dark Sky Blue
  ['internal_3', new Color3(0.468, 0.304, 0.0)],    // Dark Orange #774D00
  ['internal_4', new Color3(0.0, 0.251, 0.239)],       // Dark Teal #00403D
]);

const defaultColor = new Color3(1, 1, 1);
const defaultAmount = 1.0;

/**
 * Converts CSV row to ConnectionMarker object
 */
function csvRowToConnectionMarker(row: ConnectionCSVRow): ConnectionMarker {
  return {
    flow_id: row.Flow_Id,
    id_from: row.Id_From,
    id_to: row.Id_To,
    step_type: row.step_type,
    // product: row.product,
    amount: defaultAmount,
    color: colors.get(row.step_type) || defaultColor
  };
}

/**
 * Loads Connection markers from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise that resolves to an array of ConnectionMarker objects
 */
export async function loadConnectionsFromCSV(csvPath: string): Promise<ConnectionMarker[]> {
  try {
    const rows = await loadRowsFromCSV(csvPath);
    return rows.map(csvRowToConnectionMarker);
  } catch (error) {
    console.error('Error loading connections from CSV:', error);
    return [];
  }
}
