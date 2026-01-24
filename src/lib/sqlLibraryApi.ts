const BASE_URL = "http://127.0.0.1:5000";

export interface SQLQueryFromApi {
  id: number;
  title: string;
  description: string;
  sql_text: string;
  sql_preview: string;
  date_created: string;
  last_modified: string;
}

export interface SQLQueryResponse {
  success: boolean;
  total_sqls?: number;
  data?: SQLQueryFromApi[];
  message?: string;
  error?: string;
  sql_id?: number;
}

export interface SaveSQLRequest {
  title: string;
  description: string;
  sql: string;
}

export interface UpdateSQLRequest {
  id: number;
  title?: string;
  description?: string;
  sql?: string;
}

// Get all SQLs or search by title
export async function getSQLQueries(title?: string): Promise<SQLQueryResponse> {
  const url = title 
    ? `${BASE_URL}/sql_lib/get?title=${encodeURIComponent(title)}`
    : `${BASE_URL}/sql_lib/get`;
  
  const response = await fetch(url);
  return response.json();
}

// Get SQL by ID
export async function getSQLQueryById(id: number): Promise<SQLQueryResponse> {
  const response = await fetch(`${BASE_URL}/sql_lib/get?id=${id}`);
  return response.json();
}

// Save new SQL
export async function saveSQLQuery(data: SaveSQLRequest): Promise<SQLQueryResponse> {
  const response = await fetch(`${BASE_URL}/sql_lib/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Update SQL
export async function updateSQLQuery(data: UpdateSQLRequest): Promise<SQLQueryResponse> {
  const response = await fetch(`${BASE_URL}/sql_lib/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Delete SQL
export async function deleteSQLQuery(id: number): Promise<SQLQueryResponse> {
  const response = await fetch(`${BASE_URL}/sql_lib/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return response.json();
}
