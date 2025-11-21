import { Color3 } from '@babylonjs/core';
import type { ConnectionMarker } from '../components/ConnectionMarker';
import { loadRowsFromCSV } from './scvLoader';

interface ConnectionCSVRow {
  id_from: string;
  id_to: string;
  order_id: string;
  product: string;
  amount: string;
  colorR: string;
  colorG: string;
  colorB: string;
}

/**
 * Converts CSV row to ConnectionMarker object
 */
function csvRowToConnectionMarker(row: ConnectionCSVRow): ConnectionMarker {
  return {
    id_from: row.id_from,
    id_to: row.id_to,
    order_id: row.order_id,
    product: row.product,
    amount: parseFloat(row.amount),
    color: new Color3(
      parseFloat(row.colorR),
      parseFloat(row.colorG),
      parseFloat(row.colorB)
    ),
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
