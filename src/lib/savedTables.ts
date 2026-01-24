// Storage for saved tables (using localStorage for now)
export interface SavedTable {
  id: string;
  tableName: string;
  createdFrom: string;
  columns: string[];
  rowCount: number;
  dateCreated: string;
  timeTaken?: string;
}

const STORAGE_KEY = 'saved_tables';

export const getSavedTables = (): SavedTable[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveTable = (table: Omit<SavedTable, 'id'>): SavedTable => {
  const tables = getSavedTables();
  const newTable: SavedTable = {
    ...table,
    id: crypto.randomUUID(),
  };
  tables.push(newTable);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  return newTable;
};

export const deleteSavedTable = (id: string): void => {
  const tables = getSavedTables();
  const filtered = tables.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getTableById = (id: string): SavedTable | undefined => {
  const tables = getSavedTables();
  return tables.find(t => t.id === id);
};

export const getTableByName = (name: string): SavedTable | undefined => {
  const tables = getSavedTables();
  return tables.find(t => t.tableName === name);
};

// Mock schema tables
export const getSchemaTablesList = (): string[] => {
  return [
    'CUSTOMERS',
    'TRANSACTIONS',
    'ACCOUNTS',
    'PRODUCTS',
    'ORDERS',
    'SUBSCRIPTIONS',
    'PAYMENTS',
    'USERS',
    'SESSIONS',
    'LOGS',
  ];
};

// Mock table data generator
export const getMockTableData = (tableName: string): { columns: string[]; rows: Record<string, any>[] } => {
  // Generate dynamic columns based on table name
  const commonColumns = ['ID', 'CREATED_AT', 'UPDATED_AT'];
  
  const tableSpecificColumns: Record<string, string[]> = {
    CUSTOMERS: ['CUSTOMER_ID', 'NAME', 'EMAIL', 'PHONE', 'STATUS'],
    TRANSACTIONS: ['TRANSACTION_ID', 'AMOUNT', 'TYPE', 'STATUS', 'CUSTOMER_ID'],
    ACCOUNTS: ['ACCOUNT_ID', 'ACCOUNT_TYPE', 'BALANCE', 'CURRENCY', 'STATUS'],
    PRODUCTS: ['PRODUCT_ID', 'NAME', 'PRICE', 'CATEGORY', 'STOCK'],
    ORDERS: ['ORDER_ID', 'CUSTOMER_ID', 'TOTAL', 'STATUS', 'SHIPPING'],
    SUBSCRIPTIONS: ['SUBSCRIPTION_ID', 'PLAN', 'STATUS', 'START_DATE', 'END_DATE'],
    PAYMENTS: ['PAYMENT_ID', 'AMOUNT', 'METHOD', 'STATUS', 'REF_NO'],
    USERS: ['USER_ID', 'USERNAME', 'EMAIL', 'ROLE', 'ACTIVE'],
    SESSIONS: ['SESSION_ID', 'USER_ID', 'IP_ADDRESS', 'DEVICE', 'DURATION'],
    LOGS: ['LOG_ID', 'LEVEL', 'MESSAGE', 'SOURCE', 'TIMESTAMP'],
  };

  const columns = tableSpecificColumns[tableName] || [...commonColumns, 'DATA_1', 'DATA_2', 'DATA_3'];
  
  // Generate 10 mock rows
  const rows = Array.from({ length: 10 }, (_, i) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.includes('ID')) {
        row[col] = `${tableName.substring(0, 3)}${String(i + 1).padStart(5, '0')}`;
      } else if (col.includes('EMAIL')) {
        row[col] = `user${i + 1}@example.com`;
      } else if (col.includes('PHONE')) {
        row[col] = `+251${Math.floor(900000000 + Math.random() * 99999999)}`;
      } else if (col.includes('NAME') || col.includes('USERNAME')) {
        row[col] = `User ${i + 1}`;
      } else if (col.includes('AMOUNT') || col.includes('PRICE') || col.includes('TOTAL') || col.includes('BALANCE')) {
        row[col] = (Math.random() * 10000).toFixed(2);
      } else if (col.includes('STATUS')) {
        row[col] = ['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED'][Math.floor(Math.random() * 4)];
      } else if (col.includes('DATE') || col.includes('CREATED') || col.includes('UPDATED') || col.includes('TIMESTAMP')) {
        row[col] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (col.includes('TYPE') || col.includes('CATEGORY') || col.includes('PLAN') || col.includes('METHOD')) {
        row[col] = ['TYPE_A', 'TYPE_B', 'TYPE_C'][Math.floor(Math.random() * 3)];
      } else if (col.includes('ACTIVE')) {
        row[col] = Math.random() > 0.3 ? 'YES' : 'NO';
      } else if (col.includes('ROLE')) {
        row[col] = ['ADMIN', 'USER', 'GUEST'][Math.floor(Math.random() * 3)];
      } else if (col.includes('LEVEL')) {
        row[col] = ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)];
      } else if (col.includes('MESSAGE')) {
        row[col] = `Log message ${i + 1}`;
      } else if (col.includes('IP')) {
        row[col] = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      } else if (col.includes('DEVICE')) {
        row[col] = ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)];
      } else if (col.includes('DURATION')) {
        row[col] = `${Math.floor(Math.random() * 120)} min`;
      } else if (col.includes('STOCK')) {
        row[col] = Math.floor(Math.random() * 1000);
      } else if (col.includes('CURRENCY')) {
        row[col] = ['ETB', 'USD', 'EUR'][Math.floor(Math.random() * 3)];
      } else if (col.includes('SHIPPING')) {
        row[col] = ['EXPRESS', 'STANDARD', 'FREE'][Math.floor(Math.random() * 3)];
      } else if (col.includes('SOURCE')) {
        row[col] = ['API', 'WEB', 'APP'][Math.floor(Math.random() * 3)];
      } else if (col.includes('REF')) {
        row[col] = `REF${Math.floor(Math.random() * 1000000)}`;
      } else {
        row[col] = `Data ${i + 1}`;
      }
    });
    return row;
  });

  return { columns, rows };
};
