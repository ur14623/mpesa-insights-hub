import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Search, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DormantData {
  id: string;
  date: string;
  tableName: string;
  count: number;
}

const initialData: DormantData[] = [
  { id: "1", date: "Feb 01, 2026", tableName: "DORMANT_ACTIVATION_FEB_01", count: 34500 },
  { id: "2", date: "Jan 31, 2026", tableName: "DORMANT_ACTIVATION_JAN_31", count: 32100 },
  { id: "3", date: "Jan 30, 2026", tableName: "DORMANT_ACTIVATION_JAN_30", count: 35800 },
  { id: "4", date: "Jan 29, 2026", tableName: "DORMANT_ACTIVATION_JAN_29", count: 33200 },
  { id: "5", date: "Jan 28, 2026", tableName: "DORMANT_ACTIVATION_JAN_28", count: 31500 },
  { id: "6", date: "Jan 27, 2026", tableName: "DORMANT_ACTIVATION_JAN_27", count: 36200 },
  { id: "7", date: "Jan 26, 2026", tableName: "DORMANT_ACTIVATION_JAN_26", count: 37100 },
];

export default function DormantActivation() {
  const [data, setData] = useState<DormantData[]>(initialData);
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(d =>
      d.date.toLowerCase().includes(searchLower) ||
      d.tableName.toLowerCase().includes(searchLower) ||
      String(d.count).includes(search)
    );
  }, [data, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refreshedData = initialData.map(d => ({
        ...d,
        count: d.count + Math.floor(Math.random() * 2000),
      }));
      
      setData(refreshedData);
      setLastRefresh(new Date());
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    const csvData = filteredData.map(d => ({
      Date: d.date,
      "Table Name": d.tableName,
      Count: d.count,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dormant_activation_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Data exported successfully");
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dormant Activation</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Refresh: {format(lastRefresh, "MMM dd, yyyy HH:mm:ss")}</span>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Dormant Activation Data</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
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
                <th className="border border-border px-4 py-3 text-left font-semibold">Table Name</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{row.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm">{row.tableName}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono">{formatNumber(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
