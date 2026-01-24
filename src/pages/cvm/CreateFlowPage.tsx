import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

export default function CreateFlowPage() {
  const navigate = useNavigate();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [postFix, setPostFix] = useState("");
  const [dateType, setDateType] = useState<"fixed" | "range">("fixed");
  const [dateVal1, setDateVal1] = useState("");
  const [dateVal2, setDateVal2] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [savingTable, setSavingTable] = useState<string | null>(null);

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

      setAnalysisResults(data);
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to run analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveResult = async (tableName: string, count: number) => {
    setSavingTable(tableName);
    
    try {
      const response = await fetch("http://127.0.0.1:5000/save_single_funnel_result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: tableName, count }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setAnalysisResults(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map(r =>
            r.table === tableName ? { ...r, saved: true } : r
          ),
        };
      });
      
      toast.success(data.message || `${tableName} saved successfully`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : `Failed to save ${tableName}`);
    } finally {
      setSavingTable(null);
    }
  };

  const handleSaveAll = async () => {
    if (!analysisResults?.results) return;
    
    setSavingTable("all");
    
    try {
      const resultsToSave = analysisResults.results
        .filter(r => !r.saved)
        .map(r => ({ table: r.table, count: r.count }));

      if (resultsToSave.length === 0) {
        toast.info("All results are already saved");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/save_ga_funnel_results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          report_date: dateVal1, // <--- ADD THIS LINE
          results: resultsToSave 
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setAnalysisResults(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map(r => ({ ...r, saved: true })),
        };
      });
      
      toast.success(data.message || "All results saved successfully");
    } catch (error) {
      console.error("Save all error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save all results");
    } finally {
      setSavingTable(null);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/cvm/ga-flow-up")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New GA Funnel Analysis</h1>
          <p className="text-muted-foreground">
            Configure and trigger a new GA funnel analysis. Results will be displayed below.
          </p>
        </div>
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
                  <Label htmlFor="fixed" className="font-normal cursor-pointer">Fixed Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="font-normal cursor-pointer">Date Range</Label>
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

          <Button 
            onClick={handleRunAnalysis} 
            disabled={isAnalyzing}
            className="w-full md:w-auto"
            size="lg"
          >
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

      {/* Results Table */}
      {analysisResults && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Status: <span className="text-green-600 font-medium">{analysisResults.status}</span> | 
                  Date Info: {analysisResults.date_info}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSaveAll}
                disabled={analysisResults.results.every(r => r.saved) || savingTable === "all"}
              >
                {savingTable === "all" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border-b border-border px-4 py-3 text-left font-semibold">Table</th>
                    <th className="border-b border-border px-4 py-3 text-right font-semibold">Count</th>
                    <th className="border-b border-border px-4 py-3 text-center font-semibold">Status</th>
                    <th className="border-b border-border px-4 py-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResults.results.map((result, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-sm">{result.table}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(result.count)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === "Success" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {result.saved ? (
                          <span className="text-sm text-muted-foreground">Saved ✓</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveResult(result.table, result.count)}
                            disabled={savingTable === result.table}
                          >
                            {savingTable === result.table ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Back Button at bottom */}
      <div className="flex justify-start pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/cvm/ga-flow-up")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to GA Flow Management
        </Button>
      </div>
    </div>
  );
}
