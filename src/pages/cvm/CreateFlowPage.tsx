import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableCreationStatus {
  tableName: string;
  columns: string;
  executionTime: number | null;
  rowCount: number | null;
  status: "pending" | "in_progress" | "success" | "failed";
}

interface AnalysisResult {
  table: string;
  count: number;
  status: string;
  saved?: boolean;
}

interface AnalysisResponse {
  status: string;
  date_info: string;
  results: AnalysisResult[];
}

// Tables that will be created during analysis
const TABLE_DEFINITIONS = [
  { name: "GSM_GA", columns: "msisdn, date" },
  { name: "NOT_REGISTERED", columns: "msisdn, date" },
  { name: "REGISTERED", columns: "msisdn, date" },
  { name: "RECEIVED_3B", columns: "msisdn, date, amount" },
  { name: "NOT_RECEIVED_3B", columns: "msisdn, date" },
  { name: "UTILIZED_3B", columns: "msisdn, date, amount" },
  { name: "NOT_UTILIZED_3B", columns: "msisdn, date" },
];

export default function CreateFlowPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postFix, setPostFix] = useState("");
  const [dateType, setDateType] = useState<"fixed" | "range">("fixed");
  const [dateVal1, setDateVal1] = useState("");
  const [dateVal2, setDateVal2] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableCreationStatus[]>([]);
  const [showTracking, setShowTracking] = useState(false);

  // Initialize table statuses when analysis starts
  const initializeTableStatuses = () => {
    const initialStatuses: TableCreationStatus[] = TABLE_DEFINITIONS.map((def) => ({
      tableName: def.name,
      columns: def.columns,
      executionTime: null,
      rowCount: null,
      status: "pending" as const,
    }));
    setTableStatuses(initialStatuses);
    setShowTracking(true);
  };

  // Simulate table creation progress
  const simulateTableProgress = async () => {
    for (let i = 0; i < TABLE_DEFINITIONS.length; i++) {
      // Set current table to in_progress
      setTableStatuses((prev) =>
        prev.map((t, idx) =>
          idx === i ? { ...t, status: "in_progress" as const } : t
        )
      );

      // Wait for simulated execution time (0.5-2 seconds)
      const execTime = Math.random() * 1.5 + 0.5;
      await new Promise((resolve) => setTimeout(resolve, execTime * 1000));

      // Update to completed with random row count
      setTableStatuses((prev) =>
        prev.map((t, idx) =>
          idx === i
            ? {
                ...t,
                status: "success" as const,
                executionTime: parseFloat(execTime.toFixed(1)),
                rowCount: Math.floor(Math.random() * 50000) + 1000,
              }
            : t
        )
      );
    }
  };

  const handleRunAnalysis = async () => {
    if (!postFix.trim()) {
      toast.error("Please enter a post fix value");
      return;
    }
    if (!dateVal1) {
      toast.error("Please select a start date");
      return;
    }
    if (dateType === "range" && !dateVal2) {
      toast.error("Please select an end date for range");
      return;
    }

    setIsAnalyzing(true);
    initializeTableStatuses();

    // Start progress simulation immediately
    const progressPromise = simulateTableProgress();

    try {
      const requestBody: {
        post_fix: string;
        date_type: "fixed" | "range";
        date_val_1: string;
        date_val_2?: string;
      } = {
        post_fix: postFix,
        date_type: dateType,
        date_val_1: dateVal1,
      };

      if (dateType === "range") {
        requestBody.date_val_2 = dateVal2;
      }

      const response = await fetch("http://127.0.0.1:5000/trigger_ga_funnel_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: AnalysisResponse = await response.json();

      // Wait for progress simulation to complete
      await progressPromise;

      // Update table statuses with actual results
      if (data.results) {
        setTableStatuses((prev) =>
          prev.map((t) => {
            const result = data.results.find(
              (r) => r.table.toUpperCase().includes(t.tableName.toUpperCase())
            );
            if (result) {
              return {
                ...t,
                rowCount: result.count,
                status: result.status === "Success" ? "success" : "failed",
              };
            }
            return t;
          })
        );
      }

      setAnalysisResults(data);
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Analysis error:", error);
      // Mark remaining pending tables as failed
      setTableStatuses((prev) =>
        prev.map((t) =>
          t.status === "pending" || t.status === "in_progress"
            ? { ...t, status: "failed" as const, executionTime: 0 }
            : t
        )
      );
      toast.error(error instanceof Error ? error.message : "Failed to run analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAll = async () => {
    if (!analysisResults?.results) return;

    setSavingAll(true);

    try {
      const resultsToSave = analysisResults.results
        .filter((r) => !r.saved)
        .map((r) => ({ table: r.table, count: r.count }));

      if (resultsToSave.length === 0) {
        toast.info("All results are already saved");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/save_ga_funnel_results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_date: dateVal1,
          results: resultsToSave,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      setAnalysisResults((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((r) => ({ ...r, saved: true })),
        };
      });

      toast.success(data.message || "All results saved successfully");
    } catch (error) {
      console.error("Save all error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save all results");
    } finally {
      setSavingAll(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusBadge = (status: TableCreationStatus["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Create New GA Funnel Analysis</h1>
        <p className="text-muted-foreground">
          Configure and trigger a new GA funnel analysis. Results will be displayed below.
        </p>
      </div>

      {/* Request Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="postFix">Post Fix</Label>
              <Input
                id="postFix"
                placeholder="e.g., JAN_22 or WEEK_3"
                value={postFix}
                onChange={(e) => setPostFix(e.target.value.toUpperCase())}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date Type</Label>
              <RadioGroup
                value={dateType}
                onValueChange={(value) => setDateType(value as "fixed" | "range")}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="font-normal cursor-pointer">
                    Fixed Date
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="font-normal cursor-pointer">
                    Date Range
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dateVal1">{dateType === "fixed" ? "Date" : "Start Date"}</Label>
              <Input
                id="dateVal1"
                type="date"
                value={dateVal1}
                onChange={(e) => setDateVal1(e.target.value)}
              />
            </div>
            {dateType === "range" && (
              <div className="grid gap-2">
                <Label htmlFor="dateVal2">End Date</Label>
                <Input
                  id="dateVal2"
                  type="date"
                  value={dateVal2}
                  onChange={(e) => setDateVal2(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button onClick={handleRunAnalysis} disabled={isAnalyzing} className="w-full md:w-auto" size="lg">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Analysis...
              </>
            ) : (
              "Run Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Table Creation Progress Tracking */}
      {showTracking && (
        <Card className="border-2 shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">📊 TABLE CREATION TRACKING</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Table Name</TableHead>
                    <TableHead className="font-semibold">Columns</TableHead>
                    <TableHead className="font-semibold text-right">Execution Time</TableHead>
                    <TableHead className="font-semibold text-right">Row Count</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStatuses.map((table, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">{table.tableName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {table.columns || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {table.executionTime !== null ? `${table.executionTime}s` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {table.rowCount !== null ? formatNumber(table.rowCount) : "—"}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(table.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save All Button - Only shown when analysis is complete */}
      {analysisResults && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveAll}
            disabled={analysisResults.results.every((r) => r.saved) || savingAll}
            size="lg"
            className="gap-2"
          >
            {savingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
