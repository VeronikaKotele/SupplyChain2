import type { Company, Connection, Transaction } from '../types';

/**
 * Parses a CSV string into an array of objects
 */
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row;
  });
}

export async function loadRowsFromCSV(csvPath: string): Promise<any[]> {
  try {
    const fullPath = import.meta.env.VITE_DATASOURCE + csvPath;
    const response = await fetch(fullPath);
    console.log(`Loading CSV from: ${fullPath}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const rows = parseCSV(csvText);
    
    return rows;
  } catch (error) {
    console.error('Error loading data from CSV:', error);
    return [];
  }
}

/**
 * Loads company markers from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise that resolves to an array of Company objects
 */
export async function loadCompanies(csvPath: string): Promise<Company[]> {
  try {
    return (await loadRowsFromCSV(csvPath)) as Company[];
  } catch (error) {
    console.error('Error loading companies from CSV:', error);
    return [];
  }
}

/**
 * Loads Connection markers from a CSV file
 * @param csvPath - Path to the CSV file (relative to public folder)
 * @returns Promise that resolves to an array of Connection objects
 */
export async function loadConnections(csvPath: string): Promise<Connection[]> {
  try {
    return (await loadRowsFromCSV(csvPath)) as Connection[];
  } catch (error) {
    console.error('Error loading connections from CSV:', error);
    return [];
  }
}

interface TransactionCSVRow {
  Product_Key: string;
  Product_Name: string;
  Global_Business_Function: string;
  Category: string;
  Packaging: string;
  NART_Packaging: string;
  Flow_Id_Supplier: string;
  Flow_Id_internal: string;
  Flow_Id_Customer: string;
  Order_qty: string;
  Actual_qty: string;
  Order_value_COM: string;
  Actual_value_COM: string;
  Order_value_Sell: string;
  Actual_value_Sell: string;
}

/**
 * Converts CSV row to Transaction object
 */
function csvRowToTransaction(row: TransactionCSVRow): Transaction {
  return {
    product_key: row.Product_Key,
    product_name: row.Product_Name,
    global_business_function: row.Global_Business_Function,
    category: row.Category,
    packaging: row.Packaging,
    nart_packaging: row.NART_Packaging,
    flow_id_supplier: row.Flow_Id_Supplier,
    flow_id_internal: row.Flow_Id_internal,
    flow_id_customer: row.Flow_Id_Customer,
    order_qty: parseFloat(row.Order_qty) || 0,
    actual_qty: parseFloat(row.Actual_qty) || 0,
    order_value_com: parseFloat(row.Order_value_COM) || 0,
    actual_value_com: parseFloat(row.Actual_value_COM) || 0,
    order_value_sell: parseFloat(row.Order_value_Sell) || 0,
    actual_value_sell: parseFloat(row.Actual_value_Sell) || 0,
  };
}

/**
 * Loads transactions from CSV file
 */
export async function loadTransactions(csvPath: string): Promise<Transaction[]> {
  const rows = await loadRowsFromCSV(csvPath);
  return rows.map((row: TransactionCSVRow) => csvRowToTransaction(row));
}
