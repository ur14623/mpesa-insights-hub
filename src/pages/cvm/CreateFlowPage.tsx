import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableCreationStatus {
  table_name: string;
  columns: string;
  execution_time: string;
  count: number;
  status: "Success" | "Failed" | "Processing";
  error?: string;
}

export default function CreateFlowPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postFix, setPostFix] = useState("");
  const [dateType, setDateType] = useState<"fixed" | "range">("fixed");
  const [dateVal1, setDateVal1] = useState("");
  const [dateVal2, setDateVal2] = useState("");
  const [savingAll, setSavingAll] = useState(false);
  const [tableStatuses, setTableStatuses] = useState<TableCreationStatus[]>([]);
  const [showTracking, setShowTracking] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // Reset state and show tracking immediately
    setTableStatuses([]);
    setShowTracking(true);
    setAnalysisComplete(false);
    setIsAnalyzing(true);

    // Add processing row immediately
    setTableStatuses([{
      table_name: "Processing next...",
      columns: "...",
      execution_time: "...",
      count: 0,
      status: "Processing"
    }]);

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

      // Create abort controller for cleanup
      abortControllerRef.current = new AbortController();

      const response = await fetch("http://127.0.0.1:5000/trigger_ga_funnel_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body available");
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          // Parse SSE data format: "data: {...}"
          let jsonStr = line;
          if (line.startsWith('data:')) {
            jsonStr = line.substring(5).trim();
          }

          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data: TableCreationStatus = JSON.parse(jsonStr);
            
            setTableStatuses(prev => {
              // Remove the "Processing next..." placeholder if it exists
              const filtered = prev.filter(t => t.status !== "Processing");
              
              // Add the new completed table
              const updated = [...filtered, {
                table_name: data.table_name,
                columns: data.columns,
                execution_time: data.execution_time,
                count: data.count,
                status: data.status,
                error: data.error
              }];

              // Add processing placeholder for next table
              return [...updated, {
                table_name: "Processing next...",
                columns: "...",
                execution_time: "...",
                count: 0,
                status: "Processing" as const
              }];
            });
          } catch (parseError) {
            console.warn("Failed to parse SSE chunk:", jsonStr);
          }
        }
      }

      // Remove the final "Processing next..." placeholder
      setTableStatuses(prev => prev.filter(t => t.status !== "Processing"));
      setAnalysisComplete(true);
      toast.success("Analysis completed successfully");

    } catch (error) {
      console.error("Analysis error:", error);
      
      // Remove processing placeholder on error
      setTableStatuses(prev => prev.filter(t => t.status !== "Processing"));
      
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error(error.message || "Failed to run analysis. Please try again.");
      }
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const handleSaveAll = async () => {
    if (tableStatuses.length === 0) return;

    setSavingAll(true);

    try {
      const resultsToSave = tableStatuses
        .filter(t => t.status === "Success")
        .map(t => ({ table: t.table_name, count: t.count }));

      if (resultsToSave.length === 0) {
        toast.info("No successful results to save");
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
      toast.success(data.message || "All results saved successfully");
    } catch (error) {
      console.error("Save all error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save all results");
    } finally {
      setSavingAll(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusDisplay = (status: TableCreationStatus["status"], error?: string) => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1.5 text-primary font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Success
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 text-destructive font-medium" title={error}>
            <XCircle className="h-4 w-4" />
            Failed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
            <Hourglass className="h-4 w-4 animate-pulse" />
            Processing
          </span>
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
                    <TableRow 
                      key={idx} 
                      className={table.status === "Processing" ? "bg-muted/60" : "hover:bg-muted/30"}
                    >
                      <TableCell className="font-mono font-medium">
                        {table.table_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {table.columns || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {table.status === "Processing" ? "..." : table.execution_time || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {table.status === "Processing" ? "..." : (table.count > 0 ? formatNumber(table.count) : "—")}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusDisplay(table.status, table.error)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save All Button - Only shown when analysis is complete */}
      {analysisComplete && tableStatuses.some(t => t.status === "Success") && (
        <div className="flex justify-end">
          <Button
            onClick={handleSaveAll}
            disabled={savingAll}
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
