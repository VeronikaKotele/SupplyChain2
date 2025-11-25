import { useMemo } from 'react';
import type { OriginalDataSet, FilterState, FilteredData } from '@app/types';

export function computeFilteredData(data: OriginalDataSet, filterState: FilterState) : FilteredData {
    const filteredData = useMemo(() => {
        // Skip filtering if base data hasn't loaded
        if (data.companies.length === 0 || data.connections.length === 0 || data.transactions.length === 0) {
            return {
                companies: data.companies,
                connections: data.connections,
                transactions: data.transactions,
            }
        }

        const filteredCompanies = data.companies.filter(company => 
            filterState.selectedCompanyTypes.get(company.type) && 
            filterState.selectedCompanyNames.get(company.name)
        );

        const filteredTransactions = data.transactions.filter(transaction => {
            //const transactionDate = new Date(transaction.date);
            //const withinTimeRange = (!filterState.selectedTimeRange.startDate || transactionDate >= filterState.selectedTimeRange.startDate)
            const productCategoryEnabled = filterState.selectedProductCategories.get(transaction.category);
            
            const supplierCompany = filteredCompanies.find(c => c.id === transaction.flow_id_supplier.split('-')[0]);
            const customerCompany = filteredCompanies.find(c => c.id === transaction.flow_id_customer.split('-')[1]);
            if (!supplierCompany || !customerCompany) {
                return false;
            }
            const senderRegionEnabled = filterState.selectedSenderRegions.get(supplierCompany.country);
            const receiverRegionEnabled = filterState.selectedReceiverRegions.get(customerCompany.country);

            return productCategoryEnabled && senderRegionEnabled && receiverRegionEnabled;
        });

        const filteredConnections = data.connections.filter(connection => {
            const senderEnabled = filteredCompanies.some(company => company.id === connection.Id_From);
            const receiverEnabled = filteredCompanies.some(company => company.id === connection.Id_To);
            
            const flowUsedInTransactions = filteredTransactions.some(transaction =>
                connection.Flow_Id === transaction.flow_id_supplier ||
                connection.Flow_Id === transaction.flow_id_internal ||
                connection.Flow_Id === transaction.flow_id_customer
            );
            
            return (senderEnabled || receiverEnabled) && flowUsedInTransactions;
        });

        return {
            companies: filteredCompanies,
            connections: filteredConnections,
            transactions: filteredTransactions,
        };
  }, [data, filterState]);

  return filteredData;
}
