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