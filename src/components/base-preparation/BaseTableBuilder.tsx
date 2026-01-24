import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Rocket, Copy, RefreshCw, Eye, Database, Save } from "lucide-react";
import { saveTable } from "@/lib/savedTables";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { createTableFromSql } from "@/lib/basePreparationApi";

interface SourceTable {
  id: string;
  tableName: string;
  alias: string;
  filterType: "BASE" | "IN" | "NOT IN";
  column: string;
}

interface TableCreationStatus {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  completionTime: string | null;
  columns: string[];
  rowCount: number | null;
  result: "Success" | "Failed" | null;
}

interface BaseTableBuilderProps {
  availableTables: string[];
  postfix: string;
}

const ALIAS_LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export function BaseTableBuilder({ availableTables, postfix }: BaseTableBuilderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [baseTableName, setBaseTableName] = useState("");
  const [baseColumn, setBaseColumn] = useState("MSISDN");
  const [sourceTables, setSourceTables] = useState<SourceTable[]>([]);
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [isEdited, setIsEdited] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableCreationStatus[]>([]);

  const getNextAlias = () => {
    return ALIAS_LETTERS[sourceTables.length] || `t${sourceTables.length + 1}`;
  };

  const addSourceTable = () => {
    if (availableTables.length === 0) return;
    
    const newTable: SourceTable = {
      id: crypto.randomUUID(),
      tableName: "",
      alias: getNextAlias(),
      filterType: sourceTables.length === 0 ? "BASE" : "IN",
      column: baseColumn,
    };
    
    setSourceTables([...sourceTables, newTable]);
  };

  const removeSourceTable = (id: string) => {
    const newTables = sourceTables.filter(t => t.id !== id);
    // Reassign aliases
    const updatedTables = newTables.map((t, idx) => ({
      ...t,
      alias: ALIAS_LETTERS[idx] || `t${idx + 1}`,
    }));
    setSourceTables(updatedTables);
    setIsEdited(false);
  };

  const updateSourceTable = (id: string, field: keyof SourceTable, value: string) => {
    setSourceTables(sourceTables.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
    setIsEdited(false);
  };

  const generateSQLFromRules = () => {
    if (sourceTables.length === 0 || !baseTableName) {
      toast({
        title: "Missing Information",
        description: "Please provide base table name and add source tables.",
        variant: "destructive",
      });
      return;
    }

    const baseTable = sourceTables.find(t => t.filterType === "BASE");
    if (!baseTable || !baseTable.tableName) {
      toast({
        title: "Missing Base Table",
        description: "Please select a BASE table.",
        variant: "destructive",
      });
      return;
    }

    const fullTableName = `${baseTableName}_${postfix}`;
    const conditions = sourceTables
      .filter(t => t.filterType !== "BASE" && t.tableName)
      .map(t => {
        const operator = t.filterType === "IN" ? "IN" : "NOT IN";
        return `  AND ${baseTable.alias}.${t.column} ${operator} (SELECT ${t.column} FROM ${t.tableName})`;
      })
      .join("\n");

    const sql = `CREATE TABLE ${fullTableName} AS (
  SELECT DISTINCT ${baseTable.alias}.${baseColumn}
  FROM ${baseTable.tableName} ${baseTable.alias}
  WHERE 1=1
${conditions}
);`;

    setGeneratedSQL(sql);
    setIsEdited(false);
  };

  const copySQL = () => {
    navigator.clipboard.writeText(generatedSQL);
    toast({
      title: "Copied",
      description: "SQL copied to clipboard",
    });
  };

  const resetSQL = () => {
    generateSQLFromRules();
    setIsEdited(false);
  };

  const handleExecute = async () => {
    if (sourceTables.length === 0) {
      toast({
        title: "No Tables",
        description: "Please add source tables first.",
        variant: "destructive",
      });
      return;
    }

    if (!generatedSQL) {
      toast({
        title: "No SQL Generated",
        description: "Please generate SQL first by clicking 'Regenerate'.",
        variant: "destructive",
      });
      return;
    }

    // Initialize status for the final base table only
    const finalTableName = `${baseTableName}_${postfix}`;
    const allTables: TableCreationStatus[] = [
      {
        name: finalTableName,
        status: "pending" as const,
        completionTime: null,
        columns: [baseColumn],
        rowCount: null,
        result: null,
      },
    ];

    setTableStatuses(allTables);
    setIsGenerating(true);

    // Set status to in_progress
    setTableStatuses(prev => prev.map(t => ({ ...t, status: "in_progress" as const })));

    try {
      const response = await createTableFromSql({
        table_name: finalTableName,
        sql: generatedSQL,
      });

      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      
      setTableStatuses(prev => prev.map(t => ({
        ...t,
        status: response.success ? "completed" as const : "failed" as const,
        completionTime: now,
        rowCount: response.rows_created || response.row_count || null,
        result: response.success ? "Success" : "Failed",
      })));

      toast({
        title: response.success ? "Table Created" : "Creation Failed",
        description: response.success 
          ? `Table ${response.table_name} created with ${response.rows_created || 0} rows.`
          : response.error || "Failed to create table.",
        variant: response.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error creating table from SQL:", error);
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      
      setTableStatuses(prev => prev.map(t => ({
        ...t,
        status: "failed" as const,
        completionTime: now,
        result: "Failed",
      })));

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create table",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  };

  const getStatusBadge = (status: TableCreationStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getResultBadge = (result: TableCreationStatus["result"]) => {
    if (!result) return <span className="text-muted-foreground">—</span>;
    if (result === "Success") {
      return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Success</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  const handleSaveTable = (table: TableCreationStatus) => {
    if (table.status !== "completed" || !table.rowCount) {
      toast({
        title: "Cannot Save",
        description: "Can only save completed tables.",
        variant: "destructive",
      });
      return;
    }

    saveTable({
      tableName: table.name,
      createdFrom: `${baseTableName}_${postfix}`,
      columns: table.columns,
      rowCount: table.rowCount,
      dateCreated: table.completionTime || new Date().toISOString().split('T')[0],
      timeTaken: "N/A",
    });

    toast({
      title: "Table Saved",
      description: `Table ${table.name} has been saved.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-elegant">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            BASE TABLE BUILDER
          </CardTitle>
          <CardDescription>
            Build a final base table by combining selected tables using IN / NOT IN logic
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Base Table Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Base Table Name *</Label>
              <Input
                value={baseTableName}
                onChange={(e) => setBaseTableName(e.target.value.toUpperCase())}
                placeholder="e.g., BASE_TEST"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Final name: {baseTableName ? `${baseTableName}_${postfix}` : "—"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Base Column *</Label>
              <Select value={baseColumn} onValueChange={setBaseColumn}>
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="MSISDN">MSISDN</SelectItem>
                  <SelectItem value="CUSTOMER_ID">CUSTOMER_ID</SelectItem>
                  <SelectItem value="ACCOUNT_ID">ACCOUNT_ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source Tables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Source Tables</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addSourceTable}
                disabled={availableTables.length === 0}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Table
              </Button>
            </div>

            {sourceTables.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg border-dashed">
                No source tables added. Click "Add Table" to start.
              </p>
            ) : (
              <div className="space-y-3">
                {sourceTables.map((table, idx) => (
                  <div key={table.id} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                    <Badge variant="outline" className="min-w-[24px] justify-center">
                      {table.alias}
                    </Badge>
                    <Select 
                      value={table.tableName} 
                      onValueChange={(val) => updateSourceTable(table.id, "tableName", val)}
                    >
                      <SelectTrigger className="flex-1 bg-background">
                        <SelectValue placeholder="Select table..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {availableTables
                          .filter(t => t === table.tableName || !sourceTables.some(st => st.tableName === t))
                          .map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={table.filterType} 
                      onValueChange={(val) => updateSourceTable(table.id, "filterType", val as SourceTable["filterType"])}
                      disabled={idx === 0}
                    >
                      <SelectTrigger className="w-[120px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="BASE" disabled={idx !== 0}>BASE</SelectItem>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="NOT IN">NOT IN</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={table.column} 
                      onValueChange={(val) => updateSourceTable(table.id, "column", val)}
                    >
                      <SelectTrigger className="w-[120px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="MSISDN">MSISDN</SelectItem>
                        <SelectItem value="CUSTOMER_ID">CUSTOMER_ID</SelectItem>
                        <SelectItem value="ACCOUNT_ID">ACCOUNT_ID</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeSourceTable(table.id)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generated SQL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Generated SQL (Editable)</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateSQLFromRules} className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={copySQL} disabled={!generatedSQL} className="gap-1">
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                {isEdited && (
                  <Button variant="outline" size="sm" onClick={resetSQL} className="gap-1">
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={generatedSQL}
              onChange={(e) => {
                setGeneratedSQL(e.target.value);
                setIsEdited(true);
              }}
              placeholder="Click 'Regenerate' to generate SQL from your configuration..."
              className="font-mono text-sm min-h-[300px] bg-muted/30"
            />
          </div>

          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            className="w-full h-14 text-lg gap-2"
            disabled={isGenerating || sourceTables.length === 0 || !baseTableName}
          >
            <Rocket className="h-5 w-5" />
            {isGenerating ? "GENERATING..." : "GENERATE ALL TABLES"}
          </Button>
        </CardContent>
      </Card>

      {/* Table Creation Tracking */}
      {tableStatuses.length > 0 && (
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>TABLE CREATION TRACKING</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion Time</TableHead>
                    <TableHead>Columns</TableHead>
                    <TableHead>Row Count</TableHead>
                    <TableHead>Result</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStatuses.map((table, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{table.name || "—"}</TableCell>
                      <TableCell>{getStatusBadge(table.status)}</TableCell>
                      <TableCell>{table.completionTime || "—"}</TableCell>
                      <TableCell>{table.columns.join(", ") || "—"}</TableCell>
                      <TableCell>{table.rowCount?.toLocaleString() || "—"}</TableCell>
                      <TableCell>{getResultBadge(table.result)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/base-preparation/table/${encodeURIComponent(table.name)}`)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveTable(table)}
                            disabled={table.status !== "completed"}
                            className="gap-1"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
