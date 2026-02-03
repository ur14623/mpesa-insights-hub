import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Search, Clock  } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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

interface DailyUnutilizedBalance {
  id: string;
  date: string;
  fiveBirrTable: string;
  fiveBirrCount: number;
  hundredBirrTable: string;
  hundredBirrCount: number;
}

const initialDailyUnutilized: DailyUnutilizedBalance[] = [
  {
    id: "1",
    date: "17-Jan",
    fiveBirrTable: "5_BIRR_UNUTILIZED_JAN_17",
    fiveBirrCount: 125400,
    hundredBirrTable: "100_105_BIRR_UNUTILIZED_JAN_17",
    hundredBirrCount: 45230,
  },
  {
    id: "2",
    date: "18-Jan",
    fiveBirrTable: "5_BIRR_UNUTILIZED_JAN_18",
    fiveBirrCount: 118500,
    hundredBirrTable: "100_105_BIRR_UNUTILIZED_JAN_18",
    hundredBirrCount: 44100,
  },
  {
    id: "3",
    date: "19-Jan",
    fiveBirrTable: "5_BIRR_UNUTILIZED_JAN_19",
    fiveBirrCount: 132000,
    hundredBirrTable: "100_105_BIRR_UNUTILIZED_JAN_19",
    hundredBirrCount: 46500,
  },
  {
    id: "4",
    date: "20-Jan",
    fiveBirrTable: "5_BIRR_UNUTILIZED_JAN_20",
    fiveBirrCount: 121000,
    hundredBirrTable: "100_105_BIRR_UNUTILIZED_JAN_20",
    hundredBirrCount: 43800,
  },
];

export default function UnutilizedBalanceTracking() {
  const [dailyUnutilized, setDailyUnutilized] = useState<DailyUnutilizedBalance[]>(initialDailyUnutilized);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [unutilizedSearch, setUnutilizedSearch] = useState("");

  const filteredDailyUnutilized = useMemo(() => {
    if (!unutilizedSearch) return dailyUnutilized;
    const search = unutilizedSearch.toLowerCase();
    return dailyUnutilized.filter(d =>
      d.date.toLowerCase().includes(search) ||
      d.fiveBirrTable.toLowerCase().includes(search) ||
      String(d.fiveBirrCount).includes(search) ||
      d.hundredBirrTable.toLowerCase().includes(search) ||
      String(d.hundredBirrCount).includes(search)
    );
  }, [dailyUnutilized, unutilizedSearch]);

  const handleRefreshClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRefresh = async () => {
    setShowConfirmDialog(false);
    setIsRefreshing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const refreshedData = initialDailyUnutilized.map(d => ({
        ...d,
        fiveBirrCount: d.fiveBirrCount + Math.floor(Math.random() * 5000),
        hundredBirrCount: d.hundredBirrCount + Math.floor(Math.random() * 1000),
      }));

      setDailyUnutilized(refreshedData);
      setLastRefresh(new Date());
      toast.success("Unutilized Balance data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelRefresh = () => {
    setShowConfirmDialog(false);
  };

  const exportDailyUnutilized = () => {
    const data = filteredDailyUnutilized.map(d => ({
      Date: d.date,
      "5 Birr Unutilized Table": d.fiveBirrTable,
      "5 Birr Count": d.fiveBirrCount,
      "100 & 105 Birr Table": d.hundredBirrTable,
      "100 & 105 Birr Count": d.hundredBirrCount,
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily_unutilized_balance_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Daily Unutilized Balance data exported");
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Unutilized Balance Tracking</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Refresh: {format(lastRefresh, "MMM dd, yyyy HH:mm:ss")}</span>
          </div>
        </div>
        <Button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Daily Unutilized Balance Table */}
      <Card>
        <CardHeader className="bg-amber-100 dark:bg-amber-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📊 DAILY UNUTILIZED BALANCE TABLE</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={unutilizedSearch}
                  onChange={(e) => setUnutilizedSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportDailyUnutilized} className="gap-1">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-4 py-3 text-left font-semibold">Date</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-amber-50 dark:bg-amber-900/20">5 Birr Unutilized Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-amber-50 dark:bg-amber-900/20">5 Birr Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-indigo-50 dark:bg-indigo-900/20">100 & 105 Birr Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-indigo-50 dark:bg-indigo-900/20">100 & 105 Birr Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredDailyUnutilized.map((balance) => (
                <tr key={balance.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{balance.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-amber-50/50 dark:bg-amber-900/10">{balance.fiveBirrTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-amber-50/50 dark:bg-amber-900/10">{formatNumber(balance.fiveBirrCount)}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-indigo-50/50 dark:bg-indigo-900/10">{balance.hundredBirrTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-indigo-50/50 dark:bg-indigo-900/10">{formatNumber(balance.hundredBirrCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDailyUnutilized.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh the unutilized balance data?
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
