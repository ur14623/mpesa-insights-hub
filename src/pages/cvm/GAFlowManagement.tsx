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

interface ApiTableData {
  table_name: string;
  count: number;
}

interface ApiHistoryResponse {
  status: string;
  history: Record<string, ApiTableData[]>;
}

interface DailyTask {
  id: string;
  date: string;
  gsmGa: { table: string; count: number };
  notRegistered: { table: string; count: number };
  registered: { table: string; count: number };
  received3Birr: { table: string; count: number };
  notReceived3Birr: { table: string; count: number };
  utilized3Birr: { table: string; count: number };
  notUtilized: { table: string; count: number };
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

// Helper function to find table data by pattern
const findTableData = (tables: ApiTableData[], pattern: string): { table: string; count: number } => {
  const found = tables.find(t => t.table_name.toUpperCase().includes(pattern.toUpperCase()));
  return found ? { table: found.table_name, count: found.count } : { table: "-", count: 0 };
};

// Transform API response to DailyTask array
const transformApiData = (history: Record<string, ApiTableData[]>): DailyTask[] => {
  return Object.entries(history).map(([dateStr, tables], index) => {
    // Parse date and format it
    const date = new Date(dateStr);
    const formattedDate = format(date, "dd-MMM");
    
    return {
      id: String(index + 1),
      date: formattedDate,
      gsmGa: findTableData(tables, "GSM_GA"),
      notRegistered: findTableData(tables, "NOT_REG"),
      registered: findTableData(tables, "REG_MPESA"),
      received3Birr: findTableData(tables, "REC_3B"),
      notReceived3Birr: findTableData(tables, "NOT_REC_3B"),
      utilized3Birr: findTableData(tables, "USED_3B"),
      notUtilized: findTableData(tables, "NOT_USED_3B"),
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
      gsmGa: task.gsmGa.count,
      notReg: task.notRegistered.count,
      mpesaGa: task.registered.count,
      rewarded3B: task.received3Birr.count,
      notRewarded3B: task.notReceived3Birr.count,
      buyBundle: task.utilized3Birr.count,
      notBuyBundle: task.notUtilized.count,
    }));
  }, [dailyTasks]);

  // Filtered data based on search
  const filteredDailyTasks = useMemo(() => {
    if (!dailyTaskSearch) return dailyTasks;
    const search = dailyTaskSearch.toLowerCase();
    return dailyTasks.filter(task =>
      task.date.toLowerCase().includes(search) ||
      task.gsmGa.table.toLowerCase().includes(search) ||
      task.notRegistered.table.toLowerCase().includes(search) ||
      task.registered.table.toLowerCase().includes(search) ||
      task.received3Birr.table.toLowerCase().includes(search) ||
      task.notReceived3Birr.table.toLowerCase().includes(search) ||
      task.utilized3Birr.table.toLowerCase().includes(search) ||
      task.notUtilized.table.toLowerCase().includes(search) ||
      String(task.gsmGa.count).includes(search) ||
      String(task.notRegistered.count).includes(search)
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
      "GSM_GA Table": task.gsmGa.table,
      "GSM_GA Count": task.gsmGa.count,
      "Not Registered Table": task.notRegistered.table,
      "Not Registered Count": task.notRegistered.count,
      "Registered Table": task.registered.table,
      "Registered Count": task.registered.count,
      "Received 3B Table": task.received3Birr.table,
      "Received 3B Count": task.received3Birr.count,
      "Not Received 3B Table": task.notReceived3Birr.table,
      "Not Received 3B Count": task.notReceived3Birr.count,
      "Utilized 3B Table": task.utilized3Birr.table,
      "Utilized 3B Count": task.utilized3Birr.count,
      "Not Utilized Table": task.notUtilized.table,
      "Not Utilized Count": task.notUtilized.count,
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
          <table className="w-full border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-muted/50">
                <th rowSpan={2} className="border border-border px-3 py-2 text-left font-semibold w-20">Date</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-blue-100 dark:bg-blue-900/30">GSM_GA</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-red-100 dark:bg-red-900/30">NOT Registered</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-green-100 dark:bg-green-900/30">Registered</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-yellow-100 dark:bg-yellow-900/30">RECEIVED 3 Birr</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-orange-100 dark:bg-orange-900/30">NOT Received 3 Birr</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-purple-100 dark:bg-purple-900/30">Utilized 3 Birr</th>
                <th colSpan={2} className="border border-border px-3 py-2 text-center font-semibold bg-pink-100 dark:bg-pink-900/30">Not Utilized</th>
              </tr>
              <tr className="bg-muted/30">
                <th className="border border-border px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-orange-50 dark:bg-orange-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-orange-50 dark:bg-orange-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20">Count</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-900/20">Table</th>
                <th className="border border-border px-2 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-900/20">Count</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDailyTasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/20">
                  <td className="border border-border px-3 py-2 font-medium">{task.date}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-blue-50/50 dark:bg-blue-900/10">{task.gsmGa.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-blue-50/50 dark:bg-blue-900/10">{formatNumber(task.gsmGa.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-red-50/50 dark:bg-red-900/10">{task.notRegistered.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-red-50/50 dark:bg-red-900/10">{formatNumber(task.notRegistered.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-green-50/50 dark:bg-green-900/10">{task.registered.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-green-50/50 dark:bg-green-900/10">{formatNumber(task.registered.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-yellow-50/50 dark:bg-yellow-900/10">{task.received3Birr.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-yellow-50/50 dark:bg-yellow-900/10">{formatNumber(task.received3Birr.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-orange-50/50 dark:bg-orange-900/10">{task.notReceived3Birr.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-orange-50/50 dark:bg-orange-900/10">{formatNumber(task.notReceived3Birr.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-purple-50/50 dark:bg-purple-900/10">{task.utilized3Birr.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-purple-50/50 dark:bg-purple-900/10">{formatNumber(task.utilized3Birr.count)}</td>
                  <td className="border border-border px-2 py-2 text-xs font-mono bg-pink-50/50 dark:bg-pink-900/10">{task.notUtilized.table}</td>
                  <td className="border border-border px-2 py-2 text-right font-mono bg-pink-50/50 dark:bg-pink-900/10">{formatNumber(task.notUtilized.count)}</td>
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
