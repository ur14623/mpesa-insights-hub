import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Users, Clock, Target, Gift, CreditCard, X, Wallet, Building, Upload, Moon, Rocket, Radio, RefreshCw, AlertTriangle, Scale } from "lucide-react";
import { BaseTableBuilder } from "@/components/base-preparation/BaseTableBuilder";
import { ProgressTrackingTable, TableTrackingStatus } from "@/components/base-preparation/ProgressTrackingTable";
import { useToast } from "@/hooks/use-toast";
import {
  createActiveCustomerTable,
  createVlrAttachedTable,
  createRegisteredMpesaTable,
  createTargetedTable,
  createRewardedTable,
  uploadToTable,
  createCustomerGaTable,
  createFraudTable,
  createStaffListTable,
  createCbeTopupTable,
  createFrearedFromTable,
  createDormantTable,
  createGaGsmTable,
  createBalanceThresholdTable,
  ApiResponse,
} from "@/lib/basePreparationApi";

interface TableFieldConfig {
  name: string;
  type: "text" | "file" | "date" | "number" | "select";
  label: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  options?: { value: string; label: string }[];
  step?: number;
  maxLength?: number;
  pattern?: string;
}

interface TableConfig {
  id: string;
  instanceId: string;
  label: string;
  icon: any;
  borderColor: string;
  fields: TableFieldConfig[];
  values: Record<string, any>;
}

interface TableStatus {
  name: string;
  status: "pending" | "running" | "completed" | "error";
  time: number;
  parameters: string;
  columns?: string[];
  rowCount?: number;
}

const availableTables: { id: string; label: string; icon: any; borderColor: string; fields: TableFieldConfig[] }[] = [
  { 
    id: "from_input", 
    label: "FROM INPUT", 
    icon: Upload, 
    borderColor: "border-l-emerald-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., custom_input_table" },
      { name: "file_input", type: "file", label: "File Input", required: true },
    ]
  },
  { 
    id: "ga_customers", 
    label: "GA CUSTOMERS", 
    icon: Users, 
    borderColor: "border-l-emerald-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., ga_customers_table" },
    ]
  },
  { 
    id: "staff_list", 
    label: "STAFF LIST", 
    icon: Users, 
    borderColor: "border-l-teal-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., staff_list" },
    ]
  },
  { 
    id: "active_customers", 
    label: "ACTIVE CUSTOMERS", 
    icon: Users, 
    borderColor: "border-l-green-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., active_customers" },
      { name: "data_from", type: "date", label: "Data From", required: true, placeholder: "e.g., 2024-01-31" },
      { name: "active_for", type: "number", label: "Active For (days)", required: true, placeholder: "e.g., 30", defaultValue: 30 },
    ]
  },
  { 
    id: "vlr_attached_customers", 
    label: "VLR ATTACHED CUSTOMERS", 
    icon: Clock, 
    borderColor: "border-l-blue-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., VLR_ATTACHED" },
      { name: "day_from", type: "number", label: "Day From", required: true, placeholder: "e.g., 0", defaultValue: 0 },
      { name: "day_to", type: "number", label: "Day To", required: true, placeholder: "e.g., 5", defaultValue: 5 },
    ]
  },
  { 
    id: "registered_mpesa", 
    label: "REGISTERED MPESA", 
    icon: Building, 
    borderColor: "border-l-purple-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., GA_mpesa_customers" },
      { name: "data_from", type: "date", label: "Data From", required: true, placeholder: "e.g., 2025-12-17" },
      { name: "date_to", type: "date", label: "Date To", required: true, placeholder: "e.g., 2025-12-18" },
    ]
  },
  { 
    id: "ga_gsm", 
    label: "GA GSM", 
    icon: Radio, 
    borderColor: "border-l-yellow-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., msisdn_users" },
      { name: "date_from", type: "date", label: "Date From", required: true, placeholder: "e.g., 2025-12-17" },
      { name: "date_to", type: "date", label: "Date To", required: true, placeholder: "e.g., 2025-12-18" },
    ]
  },
  { 
    id: "targeted_customers", 
    label: "TARGETED CUSTOMERS", 
    icon: Target, 
    borderColor: "border-l-red-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., pin_reset_report_test" },
      { name: "date_from", type: "date", label: "Date From", required: true, placeholder: "e.g., 2023-10-27" },
      { name: "for_last", type: "text", label: "For Last (days)", required: true, placeholder: "e.g., 7", defaultValue: "7" },
    ]
  },
  { 
    id: "rewarded_customers", 
    label: "REWARDED CUSTOMERS", 
    icon: Gift, 
    borderColor: "border-l-pink-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., REWARDED_TXN_20251218" },
      { name: "short_code", type: "text", label: "Short Code", required: true, placeholder: "e.g., 9000033" },
      { name: "data_from", type: "date", label: "Data From", required: true, placeholder: "e.g., 2025-12-01" },
      { name: "data_to", type: "date", label: "Data To", required: true, placeholder: "e.g., 2025-12-18" },
      { name: "amount", type: "number", label: "Amount", required: true, placeholder: "e.g., 100", defaultValue: 100 },
    ]
  },
  { 
    id: "cbe_topup", 
    label: "CBE TOP UP", 
    icon: CreditCard, 
    borderColor: "border-l-indigo-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., cbe_recharge_report" },
      { name: "data_from", type: "date", label: "Data From", required: true, placeholder: "e.g., 2025-09-01" },
      { name: "data_to", type: "date", label: "Data To", required: true, placeholder: "e.g., 2025-10-31" },
    ]
  },
  { 
    id: "fraud_customer", 
    label: "FRAUD CUSTOMER", 
    icon: AlertTriangle, 
    borderColor: "border-l-orange-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., fraud_detection_weekly" },
    ]
  },
  { 
    id: "rewarded_from_account", 
    label: "REWARDED FROM ACCOUNT", 
    icon: Wallet, 
    borderColor: "border-l-cyan-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., rewarded_from_account" },
    ]
  },
  { 
    id: "dormant_list", 
    label: "DORMANT LIST", 
    icon: Moon, 
    borderColor: "border-l-gray-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "e.g., dormant_list" },
    ]
  },
  { 
    id: "balance_threshold", 
    label: "BALANCE THRESHOLD", 
    icon: Scale, 
    borderColor: "border-l-amber-500",
    fields: [
      { name: "table_name", type: "text", label: "Table Name", required: true, placeholder: "EX: LOW_BAL_DEC", maxLength: 30, pattern: "^[a-zA-Z0-9_]+$" },
      { 
        name: "comparison", 
        type: "select", 
        label: "Comparison", 
        required: true, 
        options: [
          { value: "<=", label: "Less than or equal to (<=)" },
          { value: ">=", label: "Greater than or equal to (>=)" },
          { value: "<", label: "Less than (<)" },
          { value: ">", label: "Greater than (>)" },
          { value: "=", label: "Equal to (=)" },
        ],
        defaultValue: "<="
      },
      { name: "threshold", type: "number", label: "Threshold", required: true, placeholder: "e.g., 100", step: 0.01, defaultValue: 100 },
    ]
  },
];

export default function BasePreparation() {
  const { toast } = useToast();
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [selectedTables, setSelectedTables] = useState<TableConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>([]);
  const [sourceTableTrackingStatuses, setSourceTableTrackingStatuses] = useState<TableTrackingStatus[]>([]);
  const [sourceTablesCreated, setSourceTablesCreated] = useState(false);
  const fileInputRefs = useRef<Record<string, File | null>>({});

  const handleRefresh = () => {
    setSelectedTableId("");
    setSelectedTables([]);
    setIsGenerating(false);
    setStartTime(0);
    setTableStatuses([]);
    setSourceTableTrackingStatuses([]);
    setSourceTablesCreated(false);
    fileInputRefs.current = {};
    toast({
      title: "Page Reset",
      description: "All selections and data have been cleared.",
    });
  };

  const handleAddTable = () => {
    if (!selectedTableId) return;
    
    const table = availableTables.find(t => t.id === selectedTableId);
    if (!table) return;

    const initialValues: Record<string, any> = {};
    table.fields.forEach(field => {
      initialValues[field.name] = field.defaultValue !== undefined ? field.defaultValue : "";
    });

    const newTable: TableConfig = {
      ...table,
      instanceId: crypto.randomUUID(),
      values: initialValues
    };
    
    setSelectedTables([...selectedTables, newTable]);
    setSelectedTableId("");
  };

  const handleRemoveTable = (instanceId: string) => {
    setSelectedTables(selectedTables.filter(t => t.instanceId !== instanceId));
  };

  const updateTableField = (instanceId: string, fieldName: string, value: any) => {
    setSelectedTables(selectedTables.map(table => 
      table.instanceId === instanceId 
        ? { ...table, values: { ...table.values, [fieldName]: value } }
        : table
    ));
  };

  const getAllTables = () => {
    return selectedTables.map((table, idx) => ({
      name: table.values.table_name || table.label.replace(/ /g, "_"),
      status: "pending" as const,
      time: 0,
      parameters: table.values.table_name || "N/A",
      tableIndex: idx,
    }));
  };

  const callApiForTable = async (table: TableConfig): Promise<ApiResponse> => {
    const tableName = table.values.table_name || table.label.replace(/ /g, "_");
    
    switch (table.id) {
      case "active_customers":
        return createActiveCustomerTable({
          table_name: tableName,
          data_from: table.values.data_from || new Date().toISOString().split('T')[0],
          active_for: parseInt(table.values.active_for) || 30,
        });

      case "ga_customers":
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return createCustomerGaTable({
          table_name: tableName,
          data_from: yesterday.toISOString().split('T')[0],
          data_to: today.toISOString().split('T')[0],
        });

      case "vlr_attached_customers":
        return createVlrAttachedTable({
          table_name: tableName,
          day_from: parseInt(table.values.day_from) || 0,
          day_to: parseInt(table.values.day_to) || 5,
        });

      case "registered_mpesa":
        return createRegisteredMpesaTable({
          table_name: tableName,
          data_from: table.values.data_from || new Date().toISOString().split('T')[0],
          date_to: table.values.date_to || new Date().toISOString().split('T')[0],
        });

      case "ga_gsm":
        return createGaGsmTable({
          table_name: tableName,
          date_from: table.values.date_from || new Date().toISOString().split('T')[0],
          date_to: table.values.date_to || new Date().toISOString().split('T')[0],
        });

      case "targeted_customers":
        return createTargetedTable({
          table_name: tableName,
          date_from: table.values.date_from || new Date().toISOString().split('T')[0],
          for_last: table.values.for_last || "7",
        });

      case "rewarded_customers":
        return createRewardedTable({
          table_name: tableName,
          short_code: table.values.short_code || "9000033",
          data_from: table.values.data_from || new Date().toISOString().split('T')[0],
          data_to: table.values.data_to || new Date().toISOString().split('T')[0],
          amount: parseInt(table.values.amount) || 100,
        });

      case "from_input": {
        const file = fileInputRefs.current[table.instanceId];
        if (!file) {
          throw new Error("No file selected");
        }
        return uploadToTable(tableName, file);
      }

      case "fraud_customer":
        return createFraudTable({ table_name: tableName });

      case "staff_list":
        return createStaffListTable({ table_name: tableName });

      case "cbe_topup":
        return createCbeTopupTable({
          table_name: tableName,
          data_from: table.values.data_from || new Date().toISOString().split('T')[0],
          data_to: table.values.data_to || new Date().toISOString().split('T')[0],
        });

      case "rewarded_from_account":
        return createFrearedFromTable({
          table_name: tableName,
          account_number: "9000069",
        });

      case "dormant_list":
        return createDormantTable({ table_name: tableName });

      case "balance_threshold":
        return createBalanceThresholdTable({
          table_name: tableName,
          threshold: parseFloat(table.values.threshold) || 100,
          comparison: table.values.comparison || "<=",
        });

      default:
        return {
          success: true,
          table_name: tableName,
          columns: ["MSISDN"],
          row_count: Math.floor(Math.random() * 100000) + 1000,
          execution_time_seconds: Math.random() * 10 + 1,
        };
    }
  };

  const handleGenerate = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No Tables Selected",
        description: "Please select at least one table to generate.",
        variant: "destructive"
      });
      return;
    }

    // Initialize source table tracking statuses
    const initialStatuses: TableTrackingStatus[] = selectedTables.map(t => ({
      tableName: t.values.table_name || t.label.replace(/ /g, "_"),
      columns: [],
      status: "pending",
      executionTime: null,
      rowCount: null,
      result: null,
    }));
    setSourceTableTrackingStatuses(initialStatuses);

    const tables = getAllTables();
    setTableStatuses(tables.map(t => ({ ...t, tableIndex: undefined })));
    setIsGenerating(true);
    setStartTime(Date.now());
    
    toast({
      title: "Starting Generation",
      description: `Generating ${tables.length} source tables...`,
    });

    for (let i = 0; i < selectedTables.length; i++) {
      const table = selectedTables[i];
      const startTableTime = Date.now();

      setTableStatuses(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "running" };
        return updated;
      });

      setSourceTableTrackingStatuses(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "in_progress" };
        return updated;
      });

      const interval = setInterval(() => {
        setTableStatuses(prev => {
          const updated = [...prev];
          if (updated[i]?.status === "running") {
            updated[i] = { ...updated[i], time: Math.floor((Date.now() - startTableTime) / 1000) };
          }
          return updated;
        });
        setSourceTableTrackingStatuses(prev => {
          const updated = [...prev];
          if (updated[i]?.status === "in_progress") {
            updated[i] = { ...updated[i], executionTime: Math.floor((Date.now() - startTableTime) / 1000) };
          }
          return updated;
        });
      }, 1000);

      try {
        const response = await callApiForTable(table);
        clearInterval(interval);
        
        const elapsedTime = response.execution_time_seconds || (Date.now() - startTableTime) / 1000;
        
        setTableStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: response.success ? "completed" : "error",
            time: Math.round(elapsedTime * 100) / 100,
            columns: response.columns,
            rowCount: response.row_count || response.rows_inserted || response.rows_created,
          };
          return updated;
        });

        setSourceTableTrackingStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: response.success ? "completed" : "failed",
            executionTime: Math.round(elapsedTime * 100) / 100,
            columns: response.columns || [],
            rowCount: response.row_count || response.rows_inserted || response.rows_created || null,
            result: response.success ? "Success" : "Failed",
          };
          return updated;
        });
      } catch (error) {
        clearInterval(interval);
        console.error(`Error creating table ${table.values.table_name}:`, error);
        
        setTableStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: "error",
            time: Math.floor((Date.now() - startTableTime) / 1000),
          };
          return updated;
        });

        setSourceTableTrackingStatuses(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: "failed",
            executionTime: Math.floor((Date.now() - startTableTime) / 1000),
            result: "Failed",
          };
          return updated;
        });
      }
    }

    setIsGenerating(false);
    
    // Check if all tables completed successfully
    const allCompleted = sourceTableTrackingStatuses.every(s => s.status === "completed");
    setSourceTablesCreated(true);
    
    toast({
      title: "Generation Complete",
      description: "All source table creation tasks have finished.",
    });
  };

  const renderField = (table: TableConfig, field: TableFieldConfig) => {
    const value = table.values[field.name];

    switch (field.type) {
      case "text":
        return (
          <Input 
            type="text" 
            value={value} 
            onChange={(e) => {
              let newValue = e.target.value;
              // Apply pattern validation for table names (alphanumeric and underscores only)
              if (field.pattern) {
                newValue = newValue.replace(/[^a-zA-Z0-9_]/g, '');
              }
              // Apply maxLength
              if (field.maxLength && newValue.length > field.maxLength) {
                newValue = newValue.slice(0, field.maxLength);
              }
              updateTableField(table.instanceId, field.name, newValue);
            }}
            placeholder={field.placeholder}
            disabled={isGenerating}
            maxLength={field.maxLength}
          />
        );
      case "date":
        return (
          <Input 
            type="date" 
            value={value} 
            onChange={(e) => updateTableField(table.instanceId, field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isGenerating}
          />
        );
      case "number":
        return (
          <Input 
            type="number" 
            value={value} 
            onChange={(e) => updateTableField(table.instanceId, field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={isGenerating}
            step={field.step}
          />
        );
      case "select":
        return (
          <Select 
            value={value || field.defaultValue?.toString()} 
            onValueChange={(val) => updateTableField(table.instanceId, field.name, val)}
            disabled={isGenerating}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "file":
        return (
          <Input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                fileInputRefs.current[table.instanceId] = file;
              }
              updateTableField(table.instanceId, field.name, file?.name || "");
            }}
            disabled={isGenerating}
            className="cursor-pointer"
            accept=".csv,.xlsx,.xls"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Base Preparation Dashboard
          </h1>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Page
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="border-2 shadow-elegant">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                ⚙️ BASE TABLE CONFIGURATION
              </CardTitle>
              <CardDescription>Select tables and configure parameters</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div>
                <Label className="text-base font-semibold">Add Tables</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                    <SelectTrigger className="flex-1 bg-background">
                      <SelectValue placeholder="Select a table to add..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {availableTables.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTable} disabled={!selectedTableId}>
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTables.length === 0 
                    ? "No tables selected"
                    : `${selectedTables.length} table(s) selected`}
                </p>
              </div>
            </CardContent>
          </Card>

          {selectedTables.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedTables.map(table => {
                const Icon = table.icon;
                return (
                  <Card key={table.instanceId} className={`border-l-4 ${table.borderColor}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {table.label}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveTable(table.instanceId)}
                          disabled={isGenerating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {table.fields.map(field => (
                        <div key={field.name}>
                          <Label>{field.label}{field.required && " *"}</Label>
                          {renderField(table, field)}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedTables.length > 0 && (
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || sourceTablesCreated}
              size="lg"
              className="w-full h-14 text-lg gap-2 bg-gradient-primary"
            >
              <Rocket className="h-5 w-5" />
              {isGenerating ? "GENERATING SOURCE TABLES..." : sourceTablesCreated ? "SOURCE TABLES CREATED" : "CREATE ALL SOURCE TABLES"}
            </Button>
          )}

          {/* Source Table Progress Tracking */}
          <ProgressTrackingTable 
            title="SOURCE TABLE CREATION TRACKING" 
            statuses={sourceTableTrackingStatuses} 
          />

          {/* BASE TABLE BUILDER - Only visible after source tables are created */}
          {sourceTablesCreated && (
            <BaseTableBuilder 
              availableTables={selectedTables.map(t => t.values.table_name || t.label.replace(/ /g, "_"))}
              postfix=""
            />
          )}
        </div>
      </div>
    </div>
  );
}
