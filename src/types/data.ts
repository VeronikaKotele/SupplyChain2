/**
 * Data models for Supply Chain entities, connections, and transactions
 */

/**
 * Represents a company/entity in the supply chain
 */
export interface Company {
  id: string;
  type: string;
  name: string;
  country: string;
  lat: string;
  lon: string;
}

/**
 * Represents a connection/flow between entities
 */
export interface Connection {
  Flow_Id: string;
  Id_From: string;
  Id_To: string;
  step_type: string;
}

/**
 * Represents a transaction in the supply chain
 */
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
};
