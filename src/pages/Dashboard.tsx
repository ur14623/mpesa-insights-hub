import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      // back_to_active = active_30d(today) - active_30d(yesterday) - ga(today) + dropper(today)
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

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Trends</CardTitle>
        </CardHeader>
        <CardContent>
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
                      active_30d: "30D Active",
                      ga: "GA",
                      dropper: "Dropper",
                      back_to_active: "Back to Active"
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
                      active_30d: "30D Active",
                      ga: "GA",
                      dropper: "Dropper",
                      back_to_active: "Back to Active"
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
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">30D Active</TableHead>
                  <TableHead className="font-semibold text-right">GA</TableHead>
                  <TableHead className="font-semibold text-right">Dropper</TableHead>
                  <TableHead className="font-semibold text-right">Back to Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">
                      {row.date}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.active_30d)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.ga)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.dropper)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.back_to_active)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
