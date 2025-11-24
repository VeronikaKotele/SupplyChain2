import { loadRowsFromCSV } from './scvLoader';

export interface Transaction {
  product_key: string;
  product_name: string;
  global_business_function: string;
  category: string;
  packaging: string;
  nart_packaging: string;
  flow_id_supplier: string;
  flow_id_internal: string;
  flow_id_customer: string;
  order_qty: number;
  actual_qty: number;
  order_value_com: number;
  actual_value_com: number;
  order_value_sell: number;
  actual_value_sell: number;
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

export interface TransactionFilters {
  categories?: Set<string>;
  product_names?: Set<string>;
  flow_ids?: Set<string>;
  company_ids?: Set<string>;
}

export interface TransactionStats {
  totalTransactions: number;
  totalOrderQty: number;
  totalActualQty: number;
  totalOrderValue: number;
  totalActualValue: number;
  categories: string[];
  products: string[];
  flow_ids: string[];
  company_ids: string[];
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
export async function loadTransactionsFromCSV(csvPath: string): Promise<Transaction[]> {
  const rows = await loadRowsFromCSV(csvPath);
  return rows.map((row: TransactionCSVRow) => csvRowToTransaction(row));
}

/**
 * Gets transaction statistics for analysis
 */
export function getTransactionStats(transactions: Transaction[], filters: TransactionFilters | null = null): TransactionStats {
  if (transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalOrderQty: 0,
      totalActualQty: 0,
      totalOrderValue: 0,
      totalActualValue: 0,
      categories: [],
      products: [],
      flow_ids: [],
      company_ids: [],
    };
  }

  const filteredTransactions = !filters ? transactions : transactions.filter(t => {
    const categoryMatch = !filters?.categories || filters.categories.has(t.category);
    const productMatch = !filters?.product_names || filters.product_names.has(t.product_name);
    const flowIdMatch = !filters?.flow_ids || getFlowIdsForTransaction(t).some(id => filters.flow_ids!.has(id));
    const companyIdMatch = !filters?.company_ids || getUniqueCompanyIdsForTransaction(t).some(id => filters.company_ids!.has(id));
    return categoryMatch && productMatch && flowIdMatch && companyIdMatch;
  });

  return {
    totalTransactions: filteredTransactions.length,
    totalOrderQty: filteredTransactions.reduce((sum, t) => sum + t.order_qty, 0),
    totalActualQty: filteredTransactions.reduce((sum, t) => sum + t.actual_qty, 0),
    totalOrderValue: filteredTransactions.reduce((sum, t) => sum + t.order_value_sell, 0),
    totalActualValue: filteredTransactions.reduce((sum, t) => sum + t.actual_value_sell, 0),
    categories: filteredTransactions.map(t => t.category),
    products: filteredTransactions.map(t => t.product_name),
    flow_ids: filteredTransactions.flatMap(t => getFlowIdsForTransaction(t)),
    company_ids: filteredTransactions.flatMap(t => getUniqueCompanyIdsForTransaction(t)),
  };
}

/**
 * Gets unique categories from transactions
 */
export function getTransactionCategories(transactions: Transaction[]): string[] {
  const categories = new Set(transactions.map(t => t.category));
  console.log("Categories found:", categories);
  const result = Array.from(categories).sort();
  if (result.length === 0) {
    return ["product type 1", "product type 2", "product type 3", "product type 4", "product type 5"];
  }
  return result;
}

/**
 * Gets all IDs of transactions with specific categories
 * Returns a Set of indices
 */
export function getTransactionIdsForCategories(transactions: Transaction[], categories: Set<string>): Set<number> {
  const transactionIds = new Set<number>();
  
  transactions.forEach((t, index) => {
    if (categories.has(t.category)) {
      transactionIds.add(index);
    }
  });
  
  return transactionIds;
}

/**
 * Gets all flow IDs used in transactions for specific categories
 * Returns a Set of flow IDs (supplier, internal, and customer)
 */
export function getFlowIdsForCategories(transactions: Transaction[], categories: Set<string>): Set<string> {
  const flowIds = new Set<string>();
  const transactionIds = getTransactionIdsForCategories(transactions, categories);

  transactionIds.forEach(id => {
    const t = transactions[id];
    if (t.flow_id_supplier) flowIds.add(t.flow_id_supplier);
    if (t.flow_id_internal) flowIds.add(t.flow_id_internal);
    if (t.flow_id_customer) flowIds.add(t.flow_id_customer);
  });
  
  return flowIds;
}

export function getFlowIdsForTransaction(transaction: Transaction): Array<string> {
    return [transaction.flow_id_supplier, transaction.flow_id_internal, transaction.flow_id_customer]
}

export function getUniqueCompanyIdsForTransaction(transaction: Transaction): Array<string> {
    const companyIds = new Set<string>();
    getFlowIdsForTransaction(transaction).forEach(flowId => {
        if (flowId) {
            const companyIdsArray = flowId.split('-');
            if (companyIdsArray.length >= 2) {
                companyIds.add(companyIdsArray[0]);
                companyIds.add(companyIdsArray[1]);
            }
        }
    });
    return  Array.from(companyIds);
}
