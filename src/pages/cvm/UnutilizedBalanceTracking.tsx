import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw, Download, Search, Clock } from "lucide-react";
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

interface UnutilizedActionPlan {
  id: string;
  date: string;
  category: string;
  tableName: string;
  count: number;
  campaign: string;
  contactPerson: string;
  status: string;
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

const initialActionPlans: UnutilizedActionPlan[] = [
  { id: "1", date: "17-Jan", category: "5 Birr Unutilized", tableName: "5_BIRR_UNUTILIZED_JAN_17", count: 125400, campaign: "IVR", contactPerson: "John Doe", status: "RUNNING" },
  { id: "2", date: "18-Jan", category: "100 & 105 Birr Unutilized", tableName: "100_105_BIRR_UNUTILIZED_JAN_18", count: 44100, campaign: "Outbound Call", contactPerson: "Jane Smith", status: "PLANNED" },
  { id: "3", date: "19-Jan", category: "5 Birr Unutilized", tableName: "5_BIRR_UNUTILIZED_JAN_19", count: 132000, campaign: "IVR", contactPerson: "", status: "COMPLETED" },
];

const categories = ["5 Birr Unutilized", "100 & 105 Birr Unutilized"];
const campaigns = ["IVR", "Outbound Call"];
const statuses = ["PLANNED", "RUNNING", "COMPLETED"];

export default function UnutilizedBalanceTracking() {
  const [dailyUnutilized, setDailyUnutilized] = useState<DailyUnutilizedBalance[]>(initialDailyUnutilized);
  const [actionPlans, setActionPlans] = useState<UnutilizedActionPlan[]>(initialActionPlans);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Search states
  const [unutilizedSearch, setUnutilizedSearch] = useState("");
  const [actionPlanSearch, setActionPlanSearch] = useState("");

  // Filtered data
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

  const filteredActionPlans = useMemo(() => {
    if (!actionPlanSearch) return actionPlans;
    const search = actionPlanSearch.toLowerCase();
    return actionPlans.filter(p =>
      p.date.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.tableName.toLowerCase().includes(search) ||
      String(p.count).includes(search) ||
      p.campaign.toLowerCase().includes(search) ||
      p.contactPerson.toLowerCase().includes(search) ||
      p.status.toLowerCase().includes(search)
    );
  }, [actionPlans, actionPlanSearch]);

  // Get available tables from daily unutilized for auto-linking
  const availableTables = useMemo(() => {
    const tables: { table: string; count: number; category: string }[] = [];
    dailyUnutilized.forEach(d => {
      tables.push({ table: d.fiveBirrTable, count: d.fiveBirrCount, category: "5 Birr Unutilized" });
      tables.push({ table: d.hundredBirrTable, count: d.hundredBirrCount, category: "100 & 105 Birr Unutilized" });
    });
    return tables;
  }, [dailyUnutilized]);

  // Refresh handlers
  const handleRefreshClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRefresh = async () => {
    setShowConfirmDialog(false);
    setIsRefreshing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate refreshed data
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

  // Export functions
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

  const exportActionPlans = () => {
    const data = filteredActionPlans.map(p => ({
      Date: p.date,
      Category: p.category,
      "Table Name": p.tableName,
      Count: p.count,
      Campaign: p.campaign,
      "Contact Person": p.contactPerson,
      Status: p.status,
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unutilized_action_plans_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Action Plans exported");
  };

  // Action Plan CRUD
  const handleActionPlanChange = (id: string, field: keyof UnutilizedActionPlan, value: string | number) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id === id) {
        const updated = { ...plan, [field]: value };
        // Auto-link count when table is selected
        if (field === 'tableName') {
          const linkedTable = availableTables.find(t => t.table === value);
          if (linkedTable) {
            updated.count = linkedTable.count;
            updated.category = linkedTable.category;
          }
        }
        return updated;
      }
      return plan;
    }));
  };

  const addActionPlan = () => {
    const newId = String(Date.now());
    const newPlan: UnutilizedActionPlan = {
      id: newId,
      date: "",
      category: "5 Birr Unutilized",
      tableName: "",
      count: 0,
      campaign: "IVR",
      contactPerson: "",
      status: "PLANNED",
    };
    setActionPlans([...actionPlans, newPlan]);
    toast.success("New action plan row added");
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans(prev => prev.filter(plan => plan.id !== id));
    toast.success("Action plan deleted");
  };

  const formatNumber = (num: number) => num.toLocaleString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PLANNED": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "RUNNING": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "COMPLETED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "5 Birr Unutilized": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "100 & 105 Birr Unutilized": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

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

      {/* BLOCK 1: Daily Unutilized Balance Table (Read-Only) */}
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

      {/* BLOCK 2: Action Plan Table (CRUD) */}
      <Card>
        <CardHeader className="bg-green-100 dark:bg-green-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📋 ACTION PLAN</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={actionPlanSearch}
                  onChange={(e) => setActionPlanSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportActionPlans} className="gap-1">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-4 py-3 text-left font-semibold w-24">Date</th>
                <th className="border border-border px-4 py-3 text-left font-semibold w-48">Category</th>
                <th className="border border-border px-4 py-3 text-left font-semibold">Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold w-28">Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold w-36">Campaign</th>
                <th className="border border-border px-4 py-3 text-left font-semibold w-36">Contact Person</th>
                <th className="border border-border px-4 py-3 text-left font-semibold w-32">Status</th>
                <th className="border border-border px-4 py-3 text-center font-semibold w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActionPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-muted/20">
                  <td className="border border-border px-2 py-1">
                    <Input
                      value={plan.date}
                      onChange={(e) => handleActionPlanChange(plan.id, 'date', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Select
                      value={plan.category}
                      onValueChange={(value) => handleActionPlanChange(plan.id, 'category', value)}
                    >
                      <SelectTrigger className={`h-8 text-xs ${getCategoryColor(plan.category)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Select
                      value={plan.tableName}
                      onValueChange={(value) => handleActionPlanChange(plan.id, 'tableName', value)}
                    >
                      <SelectTrigger className="h-8 text-xs font-mono">
                        <SelectValue placeholder="Select table..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {availableTables
                          .filter(t => t.category === plan.category || !plan.category)
                          .map(t => (
                            <SelectItem key={t.table} value={t.table}>
                              {t.table} ({formatNumber(t.count)})
                            </SelectItem>
                          ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Input
                      type="number"
                      value={plan.count}
                      onChange={(e) => handleActionPlanChange(plan.id, 'count', parseInt(e.target.value) || 0)}
                      className="h-8 text-xs text-right"
                      readOnly={availableTables.some(t => t.table === plan.tableName)}
                    />
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Select
                      value={plan.campaign}
                      onValueChange={(value) => handleActionPlanChange(plan.id, 'campaign', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select campaign..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {campaigns.map(camp => (
                          <SelectItem key={camp} value={camp}>{camp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Input
                      value={plan.contactPerson}
                      onChange={(e) => handleActionPlanChange(plan.id, 'contactPerson', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Enter name..."
                    />
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Select
                      value={plan.status}
                      onValueChange={(value) => handleActionPlanChange(plan.id, 'status', value)}
                    >
                      <SelectTrigger className={`h-8 text-xs ${getStatusColor(plan.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-50">
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-border px-2 py-1 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteActionPlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActionPlans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No action plans matching search criteria</div>
          )}
        </CardContent>
        <div className="p-4 border-t">
          <Button onClick={addActionPlan} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Action Plan
          </Button>
        </div>
      </Card>

      {/* Refresh Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Unutilized Balance Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh Unutilized Balance data? This will reload metrics from the database.
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
