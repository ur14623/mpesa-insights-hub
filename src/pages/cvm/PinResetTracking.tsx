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

interface DailyPinReset {
  id: string;
  date: string;
  hvcTable: string;
  hvcCount: number;
  mvcTable: string;
  mvcCount: number;
  lvcTable: string;
  lvcCount: number;
}

interface PinResetActionPlan {
  id: string;
  date: string;
  category: string;
  tableName: string;
  count: number;
  campaign: string;
  contactPerson: string;
  status: string;
}

const initialDailyPinReset: DailyPinReset[] = [
  {
    id: "1",
    date: "17-Jan",
    hvcTable: "HVC_PIN_RESET_JAN_17",
    hvcCount: 8540,
    mvcTable: "MVC_PIN_RESET_JAN_17",
    mvcCount: 25230,
    lvcTable: "LVC_PIN_RESET_JAN_17",
    lvcCount: 45920,
  },
  {
    id: "2",
    date: "18-Jan",
    hvcTable: "HVC_PIN_RESET_JAN_18",
    hvcCount: 7850,
    mvcTable: "MVC_PIN_RESET_JAN_18",
    mvcCount: 24100,
    lvcTable: "LVC_PIN_RESET_JAN_18",
    lvcCount: 44150,
  },
  {
    id: "3",
    date: "19-Jan",
    hvcTable: "HVC_PIN_RESET_JAN_19",
    hvcCount: 9200,
    mvcTable: "MVC_PIN_RESET_JAN_19",
    mvcCount: 26500,
    lvcTable: "LVC_PIN_RESET_JAN_19",
    lvcCount: 47800,
  },
  {
    id: "4",
    date: "20-Jan",
    hvcTable: "HVC_PIN_RESET_JAN_20",
    hvcCount: 8100,
    mvcTable: "MVC_PIN_RESET_JAN_20",
    mvcCount: 23800,
    lvcTable: "LVC_PIN_RESET_JAN_20",
    lvcCount: 43500,
  },
];

const initialActionPlans: PinResetActionPlan[] = [
  { id: "1", date: "17-Jan", category: "HVC", tableName: "HVC_PIN_RESET_JAN_17", count: 8540, campaign: "IVR", contactPerson: "John Doe", status: "RUNNING" },
  { id: "2", date: "17-Jan", category: "MVC", tableName: "MVC_PIN_RESET_JAN_17", count: 25230, campaign: "SMS PUSH", contactPerson: "Jane Smith", status: "PLANNED" },
  { id: "3", date: "18-Jan", category: "LVC", tableName: "LVC_PIN_RESET_JAN_18", count: 44150, campaign: "SMS", contactPerson: "", status: "COMPLETED" },
];

const categories = ["HVC", "MVC", "LVC"];
const campaigns = ["IVR", "SMS PUSH", "SMS"];
const statuses = ["PLANNED", "RUNNING", "COMPLETED"];

export default function PinResetTracking() {
  const [dailyPinReset, setDailyPinReset] = useState<DailyPinReset[]>(initialDailyPinReset);
  const [actionPlans, setActionPlans] = useState<PinResetActionPlan[]>(initialActionPlans);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Search states
  const [pinResetSearch, setPinResetSearch] = useState("");
  const [actionPlanSearch, setActionPlanSearch] = useState("");

  // Editing state for action plans
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtered data
  const filteredDailyPinReset = useMemo(() => {
    if (!pinResetSearch) return dailyPinReset;
    const search = pinResetSearch.toLowerCase();
    return dailyPinReset.filter(d =>
      d.date.toLowerCase().includes(search) ||
      d.hvcTable.toLowerCase().includes(search) ||
      String(d.hvcCount).includes(search) ||
      d.mvcTable.toLowerCase().includes(search) ||
      String(d.mvcCount).includes(search) ||
      d.lvcTable.toLowerCase().includes(search) ||
      String(d.lvcCount).includes(search)
    );
  }, [dailyPinReset, pinResetSearch]);

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

  // Get available tables from daily pin reset for auto-linking
  const availableTables = useMemo(() => {
    const tables: { table: string; count: number; category: string }[] = [];
    dailyPinReset.forEach(d => {
      tables.push({ table: d.hvcTable, count: d.hvcCount, category: "HVC" });
      tables.push({ table: d.mvcTable, count: d.mvcCount, category: "MVC" });
      tables.push({ table: d.lvcTable, count: d.lvcCount, category: "LVC" });
    });
    return tables;
  }, [dailyPinReset]);

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
      const refreshedData = initialDailyPinReset.map(d => ({
        ...d,
        hvcCount: d.hvcCount + Math.floor(Math.random() * 500),
        mvcCount: d.mvcCount + Math.floor(Math.random() * 1000),
        lvcCount: d.lvcCount + Math.floor(Math.random() * 2000),
      }));

      setDailyPinReset(refreshedData);
      setLastRefresh(new Date());
      toast.success("PIN Reset data refreshed successfully");
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
  const exportDailyPinReset = () => {
    const data = filteredDailyPinReset.map(d => ({
      Date: d.date,
      "HVC Table": d.hvcTable,
      "HVC Count": d.hvcCount,
      "MVC Table": d.mvcTable,
      "MVC Count": d.mvcCount,
      "LVC Table": d.lvcTable,
      "LVC Count": d.lvcCount,
    }));

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily_pin_reset_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Daily PIN Reset data exported");
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
    link.download = `pin_reset_action_plans_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Action Plans exported");
  };

  // Action Plan CRUD
  const handleActionPlanChange = (id: string, field: keyof PinResetActionPlan, value: string | number) => {
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
    const newPlan: PinResetActionPlan = {
      id: newId,
      date: "",
      category: "HVC",
      tableName: "",
      count: 0,
      campaign: "IVR",
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
      case "HVC": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "MVC": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "LVC": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">PIN Reset Tracking</h1>
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

      {/* BLOCK 1: Daily PIN Reset Table (Read-Only) */}
      <Card>
        <CardHeader className="bg-purple-100 dark:bg-purple-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📊 DAILY PIN RESET TABLE</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={pinResetSearch}
                  onChange={(e) => setPinResetSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportDailyPinReset} className="gap-1">
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
                <th className="border border-border px-4 py-3 text-left font-semibold bg-purple-50 dark:bg-purple-900/20">HVC Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-purple-50 dark:bg-purple-900/20">HVC Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-blue-50 dark:bg-blue-900/20">MVC Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-blue-50 dark:bg-blue-900/20">MVC Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold bg-orange-50 dark:bg-orange-900/20">LVC Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold bg-orange-50 dark:bg-orange-900/20">LVC Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredDailyPinReset.map((pinReset) => (
                <tr key={pinReset.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{pinReset.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-purple-50/50 dark:bg-purple-900/10">{pinReset.hvcTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-purple-50/50 dark:bg-purple-900/10">{formatNumber(pinReset.hvcCount)}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-blue-50/50 dark:bg-blue-900/10">{pinReset.mvcTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-blue-50/50 dark:bg-blue-900/10">{formatNumber(pinReset.mvcCount)}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm bg-orange-50/50 dark:bg-orange-900/10">{pinReset.lvcTable}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono bg-orange-50/50 dark:bg-orange-900/10">{formatNumber(pinReset.lvcCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDailyPinReset.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
        </CardContent>
      </Card>

      {/* BLOCK 2: PIN Reset Action Plan Table (CRUD) */}
      <Card>
        <CardHeader className="bg-green-100 dark:bg-green-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">📋 PIN RESET ACTION PLAN</CardTitle>
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
                <th className="border border-border px-4 py-3 text-left font-semibold w-24">Category</th>
                <th className="border border-border px-4 py-3 text-left font-semibold">Table</th>
                <th className="border border-border px-4 py-3 text-right font-semibold w-28">Count</th>
                <th className="border border-border px-4 py-3 text-left font-semibold w-32">Campaign</th>
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
            <AlertDialogTitle>Refresh PIN Reset Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refresh PIN Reset data? This will reload metrics from the database.
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
