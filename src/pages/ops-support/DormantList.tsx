import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Moon, CalendarIcon, Table as TableIcon, Users, TrendingUp, BarChart3, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TableStatus = "idle" | "creating" | "completed";
type ResultStatus = "success" | "failed" | "pending";

interface TableProgress {
  stillOnDormant: { status: TableStatus; progress: number };
  backToActive: { status: TableStatus; progress: number };
  performance: { status: TableStatus; progress: number };
}

interface TableTrackingRecord {
  id: string;
  tableName: string;
  status: "in_progress" | "completed";
  count: number;
  result: ResultStatus;
}

export default function DormantList() {
  const { toast } = useToast();
  const [tablePostfix, setTablePostfix] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [activeCustomerTableName, setActiveCustomerTableName] = useState("");
  const [stillOnDormantTableName, setStillOnDormantTableName] = useState("");
  const [backToActiveTableName, setBackToActiveTableName] = useState("");
  const [performanceTableName, setPerformanceTableName] = useState("");
  const [tableProgress, setTableProgress] = useState<TableProgress>({
    stillOnDormant: { status: "idle", progress: 0 },
    backToActive: { status: "idle", progress: 0 },
    performance: { status: "idle", progress: 0 },
  });
  const [trackingRecords, setTrackingRecords] = useState<TableTrackingRecord[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addTrackingRecord = (tableName: string) => {
    const newRecord: TableTrackingRecord = {
      id: crypto.randomUUID(),
      tableName,
      status: "in_progress",
      count: 0,
      result: "pending",
    };
    setTrackingRecords(prev => [...prev, newRecord]);
    return newRecord.id;
  };

  const updateTrackingRecord = (id: string, updates: Partial<TableTrackingRecord>) => {
    setTrackingRecords(prev => prev.map(record => 
      record.id === id ? { ...record, ...updates } : record
    ));
  };

  const simulateProgress = (tableKey: keyof TableProgress, tableName: string) => {
    const recordId = addTrackingRecord(tableName);
    
    setTableProgress(prev => ({
      ...prev,
      [tableKey]: { status: "creating", progress: 0 }
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTableProgress(prev => ({
          ...prev,
          [tableKey]: { status: "completed", progress: 100 }
        }));
        const isSuccess = Math.random() > 0.2;
        updateTrackingRecord(recordId, {
          status: "completed",
          count: Math.floor(Math.random() * 10000) + 1000,
          result: isSuccess ? "success" : "failed",
        });
      } else {
        setTableProgress(prev => ({
          ...prev,
          [tableKey]: { status: "creating", progress }
        }));
      }
    }, 500);
  };

  const handleCreateActiveCustomerTable = () => {
    if (!fromDate || !toDate) {
      toast({ title: "Error", description: "Please select both From and To dates", variant: "destructive" });
      return;
    }
    if (!activeCustomerTableName.trim()) {
      toast({ title: "Error", description: "Please enter a table name", variant: "destructive" });
      return;
    }
    const recordId = addTrackingRecord(activeCustomerTableName);
    toast({ title: "Creating Active Customer Table", description: `Table: ${activeCustomerTableName}` });
    
    setTimeout(() => {
      updateTrackingRecord(recordId, {
        status: "completed",
        count: Math.floor(Math.random() * 50000) + 5000,
        result: "success",
      });
    }, 3000);
  };

  const handleCreateStillOnDormantTable = () => {
    if (!stillOnDormantTableName.trim()) {
      toast({ title: "Error", description: "Please enter table name", variant: "destructive" });
      return;
    }
    simulateProgress("stillOnDormant", stillOnDormantTableName);
    toast({ title: "Creating Still on Dormant Table", description: `Table: ${stillOnDormantTableName}` });
  };

  const handleCreateBackToActiveTable = () => {
    if (!backToActiveTableName.trim()) {
      toast({ title: "Error", description: "Please enter table name", variant: "destructive" });
      return;
    }
    simulateProgress("backToActive", backToActiveTableName);
    toast({ title: "Creating Back to Active Table", description: `Table: ${backToActiveTableName}` });
  };

  const handleCreatePerformanceTable = () => {
    if (!performanceTableName.trim()) {
      toast({ title: "Error", description: "Please enter table name", variant: "destructive" });
      return;
    }
    simulateProgress("performance", performanceTableName);
    toast({ title: "Creating Performance Table", description: `Table: ${performanceTableName}` });
  };

  const renderTableCard = (
    title: string,
    tableKey: keyof TableProgress,
    icon: React.ReactNode,
    tableName: string,
    setTableName: (value: string) => void,
    onClick: () => void
  ) => {
    const { status, progress } = tableProgress[tableKey];
    const isCreating = status === "creating";
    const isCompleted = status === "completed";

    return (
      <Card className="border shadow-sm">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="font-medium text-sm">{title}</span>
            </div>
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Table Name</Label>
            <Input
              placeholder="Enter table name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              disabled={isCreating}
              className="h-8 text-sm"
            />
          </div>
          
          {(isCreating || isCompleted) && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isCreating ? `Creating... ${Math.round(progress)}%` : "Completed"}
              </p>
            </div>
          )}
          
          <Button 
            onClick={onClick} 
            variant="secondary" 
            size="sm"
            className="w-full gap-2"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Table</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const getStatusBadge = (status: "in_progress" | "completed") => {
    if (status === "in_progress") {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">In Progress</Badge>;
    }
    return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Completed</Badge>;
  };

  const getResultBadge = (result: ResultStatus) => {
    if (result === "pending") {
      return <Badge variant="outline" className="bg-muted text-muted-foreground">Pending</Badge>;
    }
    if (result === "success") {
      return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Success</Badge>;
    }
    return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Failed</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 w-full">
      <div className="w-full p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dormant List
          </h1>
          <p className="text-muted-foreground mt-1">Manage dormant accounts and users</p>
        </div>

        {/* Configuration Card */}
        <Card className="border-2 shadow-elegant">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Set up table postfix and upload file</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tablePostfix">Table Name Postfix</Label>
                <Input
                  id="tablePostfix"
                  placeholder="Enter postfix (e.g., dec_2024)"
                  value={tablePostfix}
                  onChange={(e) => setTablePostfix(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileInput">File Input</Label>
                <Input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Active Customer Table Card */}
        <Card className="border-2 shadow-elegant">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Active Customer Table
            </CardTitle>
            <CardDescription>Select date range to create active customer table</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Table Name</Label>
                <Input
                  placeholder="Enter table name"
                  value={activeCustomerTableName}
                  onChange={(e) => setActiveCustomerTableName(e.target.value)}
                  className="w-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleCreateActiveCustomerTable} className="gap-2">
                <TableIcon className="h-4 w-4" />
                Create Active Customer Table
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table Creation Actions Card */}
        <Card className="border-2 shadow-elegant">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Table Creation Actions
            </CardTitle>
            <CardDescription>Create analysis tables based on dormant data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderTableCard(
                "Still on Dormant Table",
                "stillOnDormant",
                <Moon className="h-4 w-4 text-muted-foreground" />,
                stillOnDormantTableName,
                setStillOnDormantTableName,
                handleCreateStillOnDormantTable
              )}
              {renderTableCard(
                "Back to Active Table",
                "backToActive",
                <TrendingUp className="h-4 w-4 text-muted-foreground" />,
                backToActiveTableName,
                setBackToActiveTableName,
                handleCreateBackToActiveTable
              )}
              {renderTableCard(
                "Performance Table",
                "performance",
                <BarChart3 className="h-4 w-4 text-muted-foreground" />,
                performanceTableName,
                setPerformanceTableName,
                handleCreatePerformanceTable
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table Creation Tracking */}
        <Card className="border-2 shadow-elegant">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Table Creation Tracking
            </CardTitle>
            <CardDescription>Track the status of created tables</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {trackingRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tables created yet. Create a table to see tracking information.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.tableName}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.count > 0 ? record.count.toLocaleString() : "-"}</TableCell>
                      <TableCell>{getResultBadge(record.result)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
