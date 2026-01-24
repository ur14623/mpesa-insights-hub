import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Play, Database, Clock, Columns, Hash, AlertCircle, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveTable, SavedTable } from "@/lib/savedTables";

interface RecreatedTableInfo {
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  completionTime: string | null;
  columns: string[];
  rowCount: number | null;
  result: "Success" | "Failed" | null;
}

// Mock data - in real app this would come from state management or API
const getMockTableData = (tableName: string) => ({
  name: tableName,
  status: Math.random() > 0.3 ? "completed" : "failed",
  createdAt: "2025-12-13 10:15:32",
  timeTaken: "2.3s",
  rowCount: Math.floor(Math.random() * 500000) + 10000,
  columns: ["MSISDN", "CUSTOMER_ID"],
  createdFrom: "SOURCE_TABLE_A",
  parameters: {
    baseColumn: "MSISDN",
    filterType: "BASE",
    sourceTable: "SOURCE_TABLE_A",
  },
});

export default function TableDetailPage() {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const decodedName = decodeURIComponent(tableName || "");
  const tableData = getMockTableData(decodedName);
  
  const [newTableName, setNewTableName] = useState(decodedName);
  const [baseColumn, setBaseColumn] = useState(tableData.parameters.baseColumn);
  const [filterType, setFilterType] = useState(tableData.parameters.filterType);
  const [isRunning, setIsRunning] = useState(false);
  const [recreatedTables, setRecreatedTables] = useState<RecreatedTableInfo[]>([]);

  const handleRerun = async () => {
    if (!newTableName) {
      toast({
        title: "Missing Table Name",
        description: "Please enter a table name.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    
    // Add new table to tracking
    const newTable: RecreatedTableInfo = {
      name: newTableName,
      status: "in_progress",
      completionTime: null,
      columns: [baseColumn],
      rowCount: null,
      result: null,
    };
    
    setRecreatedTables(prev => [...prev, newTable]);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    setRecreatedTables(prev => prev.map((t, idx) => 
      idx === prev.length - 1 ? {
        ...t,
        status: success ? "completed" : "failed",
        completionTime: now,
        rowCount: success ? Math.floor(Math.random() * 500000) + 10000 : null,
        result: success ? "Success" : "Failed",
      } : t
    ));
    
    toast({
      title: success ? "Table Created" : "Table Creation Failed",
      description: success ? `Created table: ${newTableName}` : `Failed to create table: ${newTableName}`,
      variant: success ? "default" : "destructive",
    });
    
    setIsRunning(false);
  };

  const handleSaveRecreatedTable = (table: RecreatedTableInfo) => {
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
      createdFrom: decodedName,
      columns: table.columns,
      rowCount: table.rowCount,
      dateCreated: table.completionTime || new Date().toISOString().split('T')[0],
      timeTaken: "2.3s",
    });

    toast({
      title: "Table Saved",
      description: `Table ${table.name} has been saved.`,
    });
  };

  const getStatusBadge = (status: RecreatedTableInfo["status"]) => {
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

  const getResultBadge = (result: RecreatedTableInfo["result"]) => {
    if (!result) return <span className="text-muted-foreground">—</span>;
    if (result === "Success") {
      return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Success</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  const isFailed = tableData.status === "failed";

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/base-preparation")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{decodedName}</h1>
          <p className="text-muted-foreground">Table Details & Re-run Options</p>
        </div>
        <div className="ml-auto">
          {tableData.status === "completed" ? (
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Failed
            </Badge>
          )}
        </div>
      </div>

      {/* Card 1: Table Information - Vertical Layout */}
      <Card className="border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Table Information
          </CardTitle>
          <CardDescription>Metadata about this table creation</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Table Name</p>
                <p className="font-medium">{tableData.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created From</p>
                <p className="font-medium">{tableData.createdFrom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Time Taken</p>
                <p className="font-medium">{tableData.timeTaken}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date Created</p>
                <p className="font-medium">{tableData.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Columns className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Columns Used</p>
                <p className="font-medium">{tableData.columns.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Row Count</p>
                <p className="font-medium">
                  {tableData.status === "completed" 
                    ? tableData.rowCount.toLocaleString() 
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Recreate Table */}
      <Card className="border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {isFailed ? "Retry Table Creation" : "Recreate Table"}
          </CardTitle>
          <CardDescription>
            {isFailed 
              ? "Fix parameters and retry the failed table creation"
              : "Create a new table with modified parameters"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {isFailed && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                This table creation failed. Update parameters below and retry.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold">
                {isFailed ? "Table Name (Retry)" : "New Table Name"}
              </Label>
              <Input
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value.toUpperCase())}
                placeholder="Enter table name..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Base Column</Label>
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

            <div>
              <Label className="text-sm font-semibold">Filter Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="BASE">BASE</SelectItem>
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="NOT IN">NOT IN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleRerun}
            className="w-full h-12 gap-2"
            disabled={isRunning || !newTableName}
          >
            <Play className="h-4 w-4" />
            {isRunning 
              ? "Creating..." 
              : isFailed 
                ? "RETRY TABLE CREATION" 
                : "RECREATE TABLE"
            }
          </Button>
        </CardContent>
      </Card>

      {/* Card 3: Recreated Table Information */}
      {recreatedTables.length > 0 && (
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Recreated Table Information</CardTitle>
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
                  {recreatedTables.map((table, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>{getStatusBadge(table.status)}</TableCell>
                      <TableCell>{table.completionTime || "—"}</TableCell>
                      <TableCell>{table.columns.join(", ")}</TableCell>
                      <TableCell>{table.rowCount?.toLocaleString() || "—"}</TableCell>
                      <TableCell>{getResultBadge(table.result)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveRecreatedTable(table)}
                          disabled={table.status !== "completed"}
                          className="gap-1"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
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
