const BASE_URL = "http://127.0.0.1:5000";

export interface ApiResponse {
  success: boolean;
  table_name: string;
  execution_time_seconds?: number;
  created_at?: string;
  columns: string[];
  row_count?: number;
  rows_inserted?: number;
  rows_created?: number;
  message?: string;
  error?: string;
  account_number?: string;
}

// Active Customer Table
export interface ActiveCustomerRequest {
  table_name: string;
  data_from: string;
  active_for: number;
}

export async function createActiveCustomerTable(data: ActiveCustomerRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_active_customer_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// VLR Attached Table
export interface VlrAttachedRequest {
  table_name: string;
  day_from: number;
  day_to: number;
}

export async function createVlrAttachedTable(data: VlrAttachedRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_vlr_attached_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Registered MPESA Table (GA MPESA Customers)
export interface RegisteredMpesaRequest {
  table_name: string;
  data_from: string;
  date_to: string;
}

export async function createRegisteredMpesaTable(data: RegisteredMpesaRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_ga_mpesa_customers_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// GA GSM Table
export interface GaGsmRequest {
  table_name: string;
  date_from: string;
  date_to: string;
}

export async function createGaGsmTable(data: GaGsmRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_ga_gsm_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Targeted Table
export interface TargetedTableRequest {
  table_name: string;
  date_from: string;
  for_last: string;
}

export async function createTargetedTable(data: TargetedTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_targeted_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Rewarded Table
export interface RewardedTableRequest {
  table_name: string;
  short_code: string;
  data_from: string;
  data_to: string;
  amount: number;
}

export async function createRewardedTable(data: RewardedTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_rewarded_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Upload to Table (File Upload)
export async function uploadToTable(
  tableName: string,
  file: File
): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("table_name", tableName);
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload_to_table`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Create Table From SQL
export interface SqlTableRequest {
  table_name: string;
  sql: string;
}

export async function createTableFromSql(data: SqlTableRequest): Promise<ApiResponse> {
  // Clean the SQL string before sending
  const cleanedData = {
    ...data,
    sql: data.sql.trim().replace(/;$/, "") 
  };

  const response = await fetch(`${BASE_URL}/create_table_sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanedData), // Send cleaned data
  });
  
  if (!response.ok) {
     // Optional: Try to get the actual error message from the backend
     const errorDetail = await response.json().catch(() => ({}));
     throw new Error(errorDetail.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Customer GA Table
export interface CustomerGaRequest {
  table_name: string;
  data_from: string;
  data_to: string;
}

export async function createCustomerGaTable(data: CustomerGaRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_customer_ga`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Fraud Table
export interface FraudTableRequest {
  table_name: string;
}

export async function createFraudTable(data: FraudTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_fraud_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Staff List Table
export interface StaffListTableRequest {
  table_name: string;
}

export async function createStaffListTable(data: StaffListTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_staff_list_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// CBE Top Up Table
export interface CbeTopupTableRequest {
  table_name: string;
  data_from: string;
  data_to: string;
}

export async function createCbeTopupTable(data: CbeTopupTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_cbe_topup_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Freared From Table
export interface FrearedFromTableRequest {
  table_name: string;
  account_number: string;
}

export async function createFrearedFromTable(data: FrearedFromTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_freared_from_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Dormant Table
export interface DormantTableRequest {
  table_name: string;
}

export interface BalanceThresholdRequest {
  table_name: string;
  threshold: number;
  comparison: string;
}

export async function createDormantTable(data: DormantTableRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/create_dormant_table`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Get Table Data
export interface TableDataResponse {
  success: boolean;
  table_name: string;
  columns: string[];
  data: Record<string, any>[];
  row_count: number;
}

export async function getTableData(tableName: string): Promise<TableDataResponse> {
  const response = await fetch(`${BASE_URL}/get_table_data?table_name=${encodeURIComponent(tableName)}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// Balance Threshold Table
export async function createBalanceThresholdTable(data: BalanceThresholdRequest): Promise<ApiResponse> {
  const response = await fetch(`${BASE_URL}/api/create-balance-threshold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
