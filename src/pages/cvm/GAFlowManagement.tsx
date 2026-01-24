import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Download, Search, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// API response format: counts directly as numbers
interface ApiDayData {
  gsm_ga: number;
  registered: number;
  not_registered: number;
  received_3b: number;
  not_received_3b: number;
  utilized_3b: number;
  not_utilized_3b: number;
}

interface ApiHistoryResponse {
  status: string;
  history: Record<string, ApiDayData>;
}

interface DailyTask {
  id: string;
  date: string;
  gsmGa: number;
  notRegistered: number;
  registered: number;
  received3Birr: number;
  notReceived3Birr: number;
  utilized3Birr: number;
  notUtilized: number;
}

interface WeeklySummary {
  date: string;
  gsmGa: number;
  notReg: number;
  mpesaGa: number;
  rewarded3B: number;
  notRewarded3B: number;
  buyBundle: number;
  notBuyBundle: number;
}

const ROWS_PER_PAGE = 10;

// Transform API response to DailyTask array
const transformApiData = (history: Record<string, ApiDayData>): DailyTask[] => {
  return Object.entries(history).map(([dateStr, data], index) => {
    // Parse date and format it
    const date = new Date(dateStr);
    const formattedDate = format(date, "dd-MMM");
    
    return {
      id: String(index + 1),
      date: formattedDate,
      gsmGa: data.gsm_ga || 0,
      notRegistered: data.not_registered || 0,
      registered: data.registered || 0,
      received3Birr: data.received_3b || 0,
      notReceived3Birr: data.not_received_3b || 0,
      utilized3Birr: data.utilized_3b || 0,
      notUtilized: data.not_utilized_3b || 0,
    };
  }).sort((a, b) => {
    // Sort by date descending
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export default function GAFlowManagement() {
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Search states for each table
  const [dailyTaskSearch, setDailyTaskSearch] = useState("");
  const [summarySearch, setSummarySearch] = useState("");

  // Pagination states
  const [dailyTaskPage, setDailyTaskPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_ga_funnel_history");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data: ApiHistoryResponse = await response.json();
      
      if (data.status === "success" && data.history) {
        const transformedData = transformApiData(data.history);
        setDailyTasks(transformedData);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data from API");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate weekly summary from daily tasks (auto-updates when dailyTasks changes)
  const weeklySummary: WeeklySummary[] = useMemo(() => {
    return dailyTasks.map(task => ({
      date: task.date,
      gsmGa: task.gsmGa,
      notReg: task.notRegistered,
      mpesaGa: task.registered,
      rewarded3B: task.received3Birr,
      notRewarded3B: task.notReceived3Birr,
      buyBundle: task.utilized3Birr,
      notBuyBundle: task.notUtilized,
    }));
  }, [dailyTasks]);

  // Filtered data based on search
  const filteredDailyTasks = useMemo(() => {
    if (!dailyTaskSearch) return dailyTasks;
    const search = dailyTaskSearch.toLowerCase();
    return dailyTasks.filter(task =>
      task.date.toLowerCase().includes(search) ||
      String(task.gsmGa).includes(search) ||
      String(task.notRegistered).includes(search) ||
      String(task.registered).includes(search) ||
      String(task.received3Birr).includes(search) ||
      String(task.notReceived3Birr).includes(search) ||
      String(task.utilized3Birr).includes(search) ||
      String(task.notUtilized).includes(search)
    );
  }, [dailyTasks, dailyTaskSearch]);

  const filteredSummary = useMemo(() => {
    if (!summarySearch) return weeklySummary;
    const search = summarySearch.toLowerCase();
    return weeklySummary.filter(s =>
      s.date.toLowerCase().includes(search) ||
      String(s.gsmGa).includes(search) ||
      String(s.notReg).includes(search) ||
      String(s.mpesaGa).includes(search) ||
      String(s.rewarded3B).includes(search) ||
      String(s.notRewarded3B).includes(search) ||
      String(s.buyBundle).includes(search) ||
      String(s.notBuyBundle).includes(search)
    );
  }, [weeklySummary, summarySearch]);

  // Paginated data
  const paginatedDailyTasks = useMemo(() => {
    const start = (dailyTaskPage - 1) * ROWS_PER_PAGE;
    return filteredDailyTasks.slice(start, start + ROWS_PER_PAGE);
  }, [filteredDailyTasks, dailyTaskPage]);

  const paginatedSummary = useMemo(() => {
    const start = (summaryPage - 1) * ROWS_PER_PAGE;
    return filteredSummary.slice(start, start + ROWS_PER_PAGE);
  }, [filteredSummary, summaryPage]);

  // Total pages
  const totalDailyTaskPages = Math.ceil(filteredDailyTasks.length / ROWS_PER_PAGE);
  const totalSummaryPages = Math.ceil(filteredSummary.length / ROWS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => {
    setDailyTaskPage(1);
  }, [dailyTaskSearch]);

  useEffect(() => {
    setSummaryPage(1);
  }, [summarySearch]);

  // Refresh handlers
  const handleRefreshClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRefresh = async () => {
    setShowConfirmDialog(false);
    setIsRefreshing(true);

    try {
      await fetchData();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelRefresh = () => {
    setShowConfirmDialog(false);
  };

  // Export functions
  const exportDailyTasks = () => {
    const data = filteredDailyTasks.map(task => ({
      Date: task.date,
      "GSM_GA": task.gsmGa,
      "Not Registered": task.notRegistered,
      "Registered": task.registered,
      "Received 3B": task.received3Birr,
      "Not Received 3B": task.notReceived3Birr,
      "Utilized 3B": task.utilized3Birr,
      "Not Utilized": task.notUtilized,
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily_ga_flow_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Daily Task data exported");
  };

  const exportSummary = () => {
    const data = filteredSummary.map(s => ({
      Date: s.date,
      "GSM GA": s.gsmGa,
      "NOT REG": s.notReg,
      "MPESA GA": s.mpesaGa,
      "REWARDED 3B": s.rewarded3B,
      "NOT REWARDED 3B": s.notRewarded3B,
      "BUY BUNDLE": s.buyBundle,
      "NOT BUY BUNDLE": s.notBuyBundle,
    }));
    
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ga_flow_summary_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Summary data exported");
  };

  const handleCreateFlow = () => {
    navigate("/cvm/ga-flow-up/create");
  };

  const formatNumber = (num: number) => num.toLocaleString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">GA Flow Management</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Refresh: {lastRefresh ? format(lastRefresh, "MMM dd, yyyy HH:mm:ss") : "Never"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateFlow}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Flow
          </Button>
          <Button
            variant="outline"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* BLOCK 1: Daily Task for GA Flow (Read-Only) */}
      <Card>
        <CardHeader className="bg-primary/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">1️⃣ DAILY TASK FOR GA FLOW</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={dailyTaskSearch}
                  onChange={(e) => setDailyTaskSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportDailyTasks} className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left font-semibold">Date</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-primary/10">GSM_GA</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-destructive/10">NOT Registered</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-accent/20">Registered</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-primary/5">RECEIVED 3 Birr</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-destructive/5">NOT Received 3 Birr</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-primary/10">Utilized 3 Birr</th>
                <th className="border border-border px-3 py-2 text-right font-semibold bg-muted">Not Utilized</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDailyTasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/20">
                  <td className="border border-border px-3 py-2 font-medium">{task.date}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono bg-primary/5">{formatNumber(task.gsmGa)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono bg-destructive/5">{formatNumber(task.notRegistered)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono bg-accent/10">{formatNumber(task.registered)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono">{formatNumber(task.received3Birr)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono">{formatNumber(task.notReceived3Birr)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono bg-primary/5">{formatNumber(task.utilized3Birr)}</td>
                  <td className="border border-border px-3 py-2 text-right font-mono bg-muted/50">{formatNumber(task.notUtilized)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedDailyTasks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
          {/* Pagination */}
          {totalDailyTaskPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {dailyTaskPage} of {totalDailyTaskPages} ({filteredDailyTasks.length} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDailyTaskPage(p => Math.max(1, p - 1))}
                  disabled={dailyTaskPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDailyTaskPage(p => Math.min(totalDailyTaskPages, p + 1))}
                  disabled={dailyTaskPage === totalDailyTaskPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BLOCK 2: Daily GA Flow Summary (Read-Only, Auto-calculated) */}
      <Card>
        <CardHeader className="bg-secondary/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">2️⃣ DAILY GA FLOW SUMMARY</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={summarySearch}
                  onChange={(e) => setSummarySearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportSummary} className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-4 py-3 text-left font-semibold">Date</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">GSM GA</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">NOT REG</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">MPESA GA</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">REWARDED 3B</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">NOT REWARDED 3B</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">BUY BUNDLE</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">NOT BUY BUNDLE</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSummary.map((summary, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{summary.date}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono">{formatNumber(summary.gsmGa)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-red-600">{formatNumber(summary.notReg)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-green-600">{formatNumber(summary.mpesaGa)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-yellow-600">{formatNumber(summary.rewarded3B)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-orange-600">{formatNumber(summary.notRewarded3B)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-purple-600">{formatNumber(summary.buyBundle)}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono text-pink-600">{formatNumber(summary.notBuyBundle)}</td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-muted font-bold">
                <td className="border border-border px-4 py-2">TOTAL</td>
                <td className="border border-border px-4 py-2 text-right font-mono">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.gsmGa, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-red-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.notReg, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-green-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.mpesaGa, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-yellow-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.rewarded3B, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-orange-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.notRewarded3B, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-purple-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.buyBundle, 0))}</td>
                <td className="border border-border px-4 py-2 text-right font-mono text-pink-600">{formatNumber(weeklySummary.reduce((sum, s) => sum + s.notBuyBundle, 0))}</td>
              </tr>
            </tbody>
          </table>
          {paginatedSummary.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
          {/* Pagination */}
          {totalSummaryPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {summaryPage} of {totalSummaryPages} ({filteredSummary.length} records)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSummaryPage(p => Math.max(1, p - 1))}
                  disabled={summaryPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSummaryPage(p => Math.min(totalSummaryPages, p + 1))}
                  disabled={summaryPage === totalSummaryPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh the data? This will reload metrics from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRefresh}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRefresh}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
