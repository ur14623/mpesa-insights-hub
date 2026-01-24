import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { format, subDays } from "date-fns";
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

interface KPIData {
  date: string;
  active30d: number;
  ga: number;
  droper: number;
}

// Generate mock data for last 31 days
function generateMockData(): KPIData[] {
  const data: KPIData[] = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = subDays(today, i);
    data.push({
      date: format(date, "yyyy-MM-dd"),
      active30d: Math.floor(Math.random() * 500000) + 800000,
      ga: Math.floor(Math.random() * 50000) + 20000,
      droper: Math.floor(Math.random() * 30000) + 10000,
    });
  }
  
  return data;
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData[]>(() => generateMockData());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Generate new data
      const newData = generateMockData();
      setKpiData(newData);
      setLastRefresh(new Date());
      
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Refresh: {format(lastRefresh, "MMM dd, yyyy HH:mm:ss")}</span>
          </div>
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
          <CardTitle>KPI Trends (Last 31 Days)</CardTitle>
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
                  formatter={(value: number, name: string) => [
                    formatNumber(value),
                    name === "active30d" ? "30D Active" : name === "ga" ? "GA" : "Droper"
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend 
                  formatter={(value) => 
                    value === "active30d" ? "30D Active" : value === "ga" ? "GA" : "Droper"
                  }
                />
                <Bar dataKey="active30d" name="active30d" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ga" name="ga" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="droper" name="droper" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
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
                  <TableHead className="font-semibold text-right">Droper</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell className="font-medium">
                      {format(new Date(row.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.active30d)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.ga)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.droper)}</TableCell>
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
