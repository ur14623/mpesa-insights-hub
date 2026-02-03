import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Loader2, BarChart3, TableIcon } from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiKPIItem {
  date: string;
  active_30d: number;
  dropper: number;
  ga: number;
}

interface ApiResponse {
  status: string;
  data: ApiKPIItem[];
}

interface KPIData {
  date: string;
  active_30d: number;
  ga: number;
  dropper: number;
  back_to_active: number;
}

// Calculate back_to_active: active_30d(today) - active_30d(yesterday) - ga(today) + dropper(today)
function processApiData(apiData: ApiKPIItem[]): KPIData[] {
  // Sort by date ascending for calculation
  const sorted = [...apiData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sorted.map((item, index) => {
    let back_to_active = 0;
    
    if (index > 0) {
      const yesterday = sorted[index - 1];
      back_to_active = item.active_30d - yesterday.active_30d - item.ga + item.dropper;
    }

    return {
      date: item.date,
      active_30d: item.active_30d,
      ga: item.ga,
      dropper: item.dropper,
      back_to_active,
    };
  });
}

// Mock data for Who Will Churn KPI
function generateChurnData(kpiData: KPIData[]): { date: string; who_will_churn: number }[] {
  return kpiData.map((item) => ({
    date: item.date,
    who_will_churn: Math.floor(item.dropper * 0.7 + Math.random() * 2000),
  }));
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [trendView, setTrendView] = useState<"chart" | "table">("chart");
  const [churnView, setChurnView] = useState<"chart" | "table">("chart");

  const fetchKPIData = async () => {
    try {
      const response = await fetch("/kip");
      if (!response.ok) {
        throw new Error("Failed to fetch KPI data");
      }
      const result: ApiResponse = await response.json();
      
      if (result.status === "success" && result.data) {
        const processedData = processApiData(result.data);
        setKpiData(processedData);
        setLastRefresh(new Date());
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      toast.error("Failed to fetch KPI data");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchKPIData();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Table data sorted by date (latest first)
  const tableData = useMemo(() => {
    return [...kpiData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [kpiData]);

  // Chart data formatted for display
  const chartData = useMemo(() => {
    return kpiData.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), "MMM dd"),
    }));
  }, [kpiData]);

  // Generate churn data based on KPI data
  const churnData = useMemo(() => generateChurnData(kpiData), [kpiData]);

  // Churn chart data
  const churnChartData = useMemo(() => {
    return churnData.map((item) => ({
      ...item,
      dateLabel: format(new Date(item.date), "MMM dd"),
    }));
  }, [churnData]);

  // Get dates for transposed table (latest first)
  const sortedDates = useMemo(() => {
    return [...kpiData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(item => item.date);
  }, [kpiData]);

  // Create data map for quick lookup
  const dataByDate = useMemo(() => {
    const map: Record<string, KPIData> = {};
    kpiData.forEach(item => {
      map[item.date] = item;
    });
    return map;
  }, [kpiData]);

  // Churn data by date
  const churnByDate = useMemo(() => {
    const map: Record<string, number> = {};
    churnData.forEach(item => {
      map[item.date] = item.who_will_churn;
    });
    return map;
  }, [churnData]);

  const handleRefreshClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRefresh = async () => {
    setShowConfirmDialog(false);
    setIsRefreshing(true);
    
    try {
      await fetchKPIData();
      toast.success("KPI data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh KPI data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelRefresh = () => {
    setShowConfirmDialog(false);
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const formatDateHeader = (dateStr: string) => {
    return format(new Date(dateStr), "MMM dd");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const metrics = [
    { key: "active_30d", label: "Active 30D" },
    { key: "dropper", label: "Dropper" },
    { key: "ga", label: "GA" },
    { key: "back_to_active", label: "Returner" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          {lastRefresh && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Refresh: {format(lastRefresh, "MMM dd, yyyy HH:mm:ss")}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* KPI Trend Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>KPI Trend - 30D Active</CardTitle>
          <Tabs value={trendView} onValueChange={(v) => setTrendView(v as "chart" | "table")}>
            <TabsList className="h-9">
              <TabsTrigger value="chart" className="gap-2 px-3">
                <BarChart3 className="h-4 w-4" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2 px-3">
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {trendView === "chart" ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="dateLabel" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={2}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        active_30d: "Active 30D",
                        ga: "GA",
                        dropper: "Dropper",
                        back_to_active: "Returner"
                      };
                      return [formatNumber(value), labels[name] || name];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        active_30d: "Active 30D",
                        ga: "GA",
                        dropper: "Dropper",
                        back_to_active: "Returner"
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Bar dataKey="active_30d" name="active_30d" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="ga" name="ga" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="dropper" name="dropper" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="back_to_active" name="back_to_active" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto max-h-[400px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th className="border border-border px-4 py-3 text-left font-semibold bg-muted/50 sticky left-0 z-20 min-w-[120px]">
                      Metric
                    </th>
                    {sortedDates.map((date) => (
                      <th key={date} className="border border-border px-3 py-3 text-right font-semibold bg-muted/50 min-w-[80px]">
                        {formatDateHeader(date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.key} className="hover:bg-muted/20">
                      <td className="border border-border px-4 py-2 font-medium sticky left-0 bg-background z-10">
                        {metric.label}
                      </td>
                      {sortedDates.map((date) => (
                        <td key={date} className="border border-border px-3 py-2 text-right font-mono text-sm">
                          {formatNumber(dataByDate[date]?.[metric.key as keyof KPIData] as number || 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Who Will Churn Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Who Will Churn</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Users expected to drop out from the 30-day active base (rolling 30 days, updated daily)
            </p>
          </div>
          <Tabs value={churnView} onValueChange={(v) => setChurnView(v as "chart" | "table")}>
            <TabsList className="h-9">
              <TabsTrigger value="chart" className="gap-2 px-3">
                <BarChart3 className="h-4 w-4" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="table" className="gap-2 px-3">
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {churnView === "chart" ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={churnChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="dateLabel" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={2}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), "Who Will Churn"]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="who_will_churn" name="Who Will Churn" fill="hsl(var(--chart-5))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-md border overflow-auto max-h-[300px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-background z-10">
                  <tr>
                    <th className="border border-border px-4 py-3 text-left font-semibold bg-muted/50 sticky left-0 z-20 min-w-[120px]">
                      Metric
                    </th>
                    {sortedDates.map((date) => (
                      <th key={date} className="border border-border px-3 py-3 text-right font-semibold bg-muted/50 min-w-[80px]">
                        {formatDateHeader(date)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-muted/20">
                    <td className="border border-border px-4 py-2 font-medium sticky left-0 bg-background z-10">
                      Who Will Churn
                    </td>
                    {sortedDates.map((date) => (
                      <td key={date} className="border border-border px-3 py-2 text-right font-mono text-sm">
                        {formatNumber(churnByDate[date] || 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh KPI Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh the KPI data?
              This action may take a few moments.
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
