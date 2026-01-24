import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, RefreshCw, Download, Search, Clock, Edit2, Check, X } from "lucide-react";
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

interface DailyDroper {
  id: string;
  date: string;
  dailyDroperTable: string;
  dailyDroperCount: number;
  droper30dTable1: string;
  droper30dCount1: number;
  droper30dTable2?: string;
  droper30dCount2?: number;
}

interface DroperActionPlan {
  id: string;
  date: string;
  category: string;
  tableName: string;
  count: number;
  campaign: string;
  contactPerson: string;
  status: string;
}

const initialDailyDroper: DailyDroper[] = [
  {
    id: "1",
    date: "17-Jan",
    dailyDroperTable: "DAILY_DROPER_JAN_17",
    dailyDroperCount: 12540,
    droper30dTable1: "DROPER_30D_JAN_17_A",
    droper30dCount1: 45230,
    droper30dTable2: "DROPER_30D_JAN_17_B",
    droper30dCount2: 8920,
  },
  {
    id: "2",
    date: "18-Jan",
    dailyDroperTable: "DAILY_DROPER_JAN_18",
    dailyDroperCount: 11850,
    droper30dTable1: "DROPER_30D_JAN_18_A",
    droper30dCount1: 44100,
    droper30dTable2: "DROPER_30D_JAN_18_B",
    droper30dCount2: 9150,
  },
  {
    id: "3",
    date: "19-Jan",
    dailyDroperTable: "DAILY_DROPER_JAN_19",
    dailyDroperCount: 13200,
    droper30dTable1: "DROPER_30D_JAN_19_A",
    droper30dCount1: 46500,
    droper30dTable2: "",
    droper30dCount2: 0,
  },
  {
    id: "4",
    date: "20-Jan",
    dailyDroperTable: "DAILY_DROPER_JAN_20",
    dailyDroperCount: 12100,
    droper30dTable1: "DROPER_30D_JAN_20_A",
    droper30dCount1: 43800,
  },
];

const initialActionPlans: DroperActionPlan[] = [
  { id: "1", date: "17-Jan", category: "DROPER FROM 30D", tableName: "DROPER_30D_JAN_17_A", count: 45230, campaign: "OD, CURRENT WIN BACK", contactPerson: "John Doe", status: "RUNNING" },
  { id: "2", date: "18-Jan", category: "DROPER FROM 30D", tableName: "DROPER_30D_JAN_18_A", count: 44100, campaign: "RE-ENGAGEMENT", contactPerson: "Jane Smith", status: "PLANNED" },
  { id: "3", date: "19-Jan", category: "DROPER FROM 30D", tableName: "DROPER_30D_JAN_19_A", count: 46500, campaign: "WIN BACK PROMO", contactPerson: "", status: "COMPLETED" },
];

const statuses = ["PLANNED", "RUNNING", "COMPLETED"];

export default function DroperTracking() {
  const [dailyDroper, setDailyDroper] = useState<DailyDroper[]>(initialDailyDroper);
  const [actionPlans, setActionPlans] = useState<DroperActionPlan[]>(initialActionPlans);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Search states
  const [droperSearch, setDroperSearch] = useState("");
  const [actionPlanSearch, setActionPlanSearch] = useState("");

  // Editing state for action plans
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtered data
  const filteredDailyDroper = useMemo(() => {
    if (!droperSearch) return dailyDroper;
    const search = droperSearch.toLowerCase();
    return dailyDroper.filter(d =>
      d.date.toLowerCase().includes(search) ||
      d.dailyDroperTable.toLowerCase().includes(search) ||
      String(d.dailyDroperCount).includes(search) ||
      d.droper30dTable1.toLowerCase().includes(search) ||
      String(d.droper30dCount1).includes(search) ||
      (d.droper30dTable2 && d.droper30dTable2.toLowerCase().includes(search)) ||
      (d.droper30dCount2 && String(d.droper30dCount2).includes(search))
    );
  }, [dailyDroper, droperSearch]);

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

  // Get available tables from daily droper for auto-linking
  const availableTables = useMemo(() => {
    const tables: { table: string; count: number }[] = [];
    dailyDroper.forEach(d => {
      if (d.droper30dTable1) {
        tables.push({ table: d.droper30dTable1, count: d.droper30dCount1 });
      }
      if (d.droper30dTable2) {
        tables.push({ table: d.droper30dTable2, count: d.droper30dCount2 || 0 });
      }
    });
    return tables;
  }, [dailyDroper]);

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
      const refreshedData = initialDailyDroper.map(d => ({
        ...d,
        dailyDroperCount: d.dailyDroperCount + Math.floor(Math.random() * 500),
        droper30dCount1: d.droper30dCount1 + Math.floor(Math.random() * 1000),
        droper30dCount2: d.droper30dCount2 ? d.droper30dCount2 + Math.floor(Math.random() * 200) : undefined,
      }));

      setDailyDroper(refreshedData);
      setLastRefresh(new Date());
      toast.success("Droper data refreshed successfully");
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
  const exportDailyDroper = () => {
    const data = filteredDailyDroper.map(d => ({
      Date: d.date,
      "Daily DROPER Table": d.dailyDroperTable,
      "Daily DROPER Count": d.dailyDroperCount,
      "DROPER FROM 30D Table": d.droper30dTable1,
      "DROPER FROM 30D Count": d.droper30dCount1,
      "DROPER FROM 30D Table (2)": d.droper30dTable2 || "",
      "DROPER FROM 30D Count (2)": d.droper30dCount2 || "",
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily_droper_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Daily Droper data exported");
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
    link.download = `droper_action_plans_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Action Plans exported");
  };

  // Action Plan CRUD
  const handleActionPlanChange = (id: string, field: keyof DroperActionPlan, value: string | number) => {
    setActionPlans(prev => prev.map(plan => {
      if (plan.id === id) {
        const updated = { ...plan, [field]: value };
        // Auto-link count when table is selected
        if (field === 'tableName') {
          const linkedTable = availableTables.find(t => t.table === value);
          if (linkedTable) {
            updated.count = linkedTable.count;
          }
        }
        return updated;
      }
      return plan;
    }));
  };

  const addActionPlan = () => {
    const newId = String(Date.now());
    const newPlan: DroperActionPlan = {
      id: newId,
      date: "",
      category: "DROPER FROM 30D",
      tableName: "",
      count: 0,
      campaign: "",
      contactPerson: "",
      status: "PLANNED",
    };
    setActionPlans([...actionPlans, newPlan]);
    setEditingId(newId);
    toast.success("New action plan row added");
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans(prev => prev.filter(plan => plan.id !== id));
    toast.success("Action plan deleted");
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Droper Tracking</h1>
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

      {/* BLOCK 1: Daily Droper Table (Read-Only) */}
      <Card>
        <CardHeader className="bg-orange-100 dark:bg-orange-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📊 DAILY DROPER TABLE</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={droperSearch}
                  onChange={(e) => setDroperSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportDailyDroper} className="gap-1">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-4 py-3 text-left font-semibold">Date</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-red-50 dark:bg-red-900/20">Daily DROPER Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-red-50 dark:bg-red-900/20">Daily DROPER Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/20">DROPER FROM 30D Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/20">DROPER FROM 30D Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-purple-50 dark:bg-purple-900/20">DROPER FROM 30D Table (2)</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-purple-50 dark:bg-purple-900/20">DROPER FROM 30D Count (2)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDailyDroper.map((droper) => (
                <tr key={droper.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{droper.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-red-50/50 dark:bg-red-900/10">{droper.dailyDroperTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-red-50/50 dark:bg-red-900/10">{formatNumber(droper.dailyDroperCount)}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-blue-50/50 dark:bg-blue-900/10">{droper.droper30dTable1}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-blue-50/50 dark:bg-blue-900/10">{formatNumber(droper.droper30dCount1)}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-purple-50/50 dark:bg-purple-900/10">{droper.droper30dTable2 || "—"}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-purple-50/50 dark:bg-purple-900/10">{droper.droper30dCount2 ? formatNumber(droper.droper30dCount2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDailyDroper.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
        </CardContent>
      </Card>

      {/* BLOCK 2: Droper Action Plan Table (CRUD) */}
      <Card>
        <CardHeader className="bg-green-100 dark:bg-green-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📋 DROPER ACTION PLAN</CardTitle>
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
                <th className="border border-border px-4 py-3 text-left font-semibold w-40">Category</th>
                <th className="border border-border px-4 py-3 text-left font-semibold">Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold w-28">Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold">Campaign</th>
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
                    <Input
                      value={plan.category}
                      onChange={(e) => handleActionPlanChange(plan.id, 'category', e.target.value)}
                      className="h-8 text-sm"
                      disabled
                    />
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
                        {availableTables.map(t => (
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
                    <Input
                      value={plan.campaign}
                      onChange={(e) => handleActionPlanChange(plan.id, 'campaign', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="e.g., OD, CURRENT WIN BACK"
                    />
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Input
                      value={plan.contactPerson}
                      onChange={(e) => handleActionPlanChange(plan.id, 'contactPerson', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="border border-border px-2 py-1">
                    <Select
                      value={plan.status}
                      onValueChange={(value) => handleActionPlanChange(plan.id, 'status', value)}
                    >
                      <SelectTrigger className={`h-8 text-xs ${
                        plan.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        plan.status === 'RUNNING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
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
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
          <div className="p-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={addActionPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action Plan Row
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refresh Droper Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh the Droper data? This will reload metrics from the database.
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
