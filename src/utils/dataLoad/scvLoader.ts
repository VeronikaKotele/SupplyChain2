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