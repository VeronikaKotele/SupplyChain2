import type { Transaction, TransactionStats } from '@app/types';

/**
 * Gets transaction statistics for analysis
 */
export function getTransactionStats(transactions: Transaction[]): TransactionStats {
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

  return {
    totalTransactions: transactions.length,
    totalOrderQty: transactions.reduce((sum, t) => sum + t.order_qty, 0),
    totalActualQty: transactions.reduce((sum, t) => sum + t.actual_qty, 0),
    totalOrderValue: transactions.reduce((sum, t) => sum + t.order_value_sell, 0),
    totalActualValue: transactions.reduce((sum, t) => sum + t.actual_value_sell, 0),
    categories: Array.from(new Set(transactions.map(t => t.category))),
    products: Array.from(new Set(transactions.map(t => t.product_name))),
    flow_ids: Array.from(new Set(transactions.flatMap(t => getFlowIdsForTransaction(t)))),
    company_ids: Array.from(new Set(transactions.flatMap(t => getUniqueCompanyIdsForTransaction(t)))),
  };
}

function getFlowIdsForTransaction(transaction: Transaction): Array<string> {
    return [transaction.flow_id_supplier, transaction.flow_id_internal, transaction.flow_id_customer]
}

function getUniqueCompanyIdsForTransaction(transaction: Transaction): Array<string> {
    const companyIds = new Set<string>();
    getFlowIdsForTransaction(transaction).forEach(flowId => {
        if (flowId) {
            const companyIdsForFlow = getCompanyIdsForFlow(flowId);
            companyIds.add(companyIdsForFlow.sender);
            companyIds.add(companyIdsForFlow.receiver);
        }
    });
    return Array.from(companyIds);
}

function getCompanyIdsForFlow(flow_id: string): { sender: string, receiver: string } {
    const companyIdsArray = flow_id.split('-');
    if (companyIdsArray.length < 2) {
        return { sender: '', receiver: '' };
    }
    return { sender: companyIdsArray[0], receiver: companyIdsArray[1] };
}
