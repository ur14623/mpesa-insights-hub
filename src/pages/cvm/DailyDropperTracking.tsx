import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Download, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DailyDropper {
  id: string;
  date: string;
  dailyDropper: string;
  dailyDropperCount: number;
}

const initialData: DailyDropper[] = [
  { id: "1", date: "Feb 01, 2026", dailyDropper: "DAILY_DROPPER_FEB_01", dailyDropperCount: 12540 },
  { id: "2", date: "Jan 31, 2026", dailyDropper: "DAILY_DROPPER_JAN_31", dailyDropperCount: 11850 },
  { id: "3", date: "Jan 30, 2026", dailyDropper: "DAILY_DROPPER_JAN_30", dailyDropperCount: 13200 },
  { id: "4", date: "Jan 29, 2026", dailyDropper: "DAILY_DROPPER_JAN_29", dailyDropperCount: 12100 },
  { id: "5", date: "Jan 28, 2026", dailyDropper: "DAILY_DROPPER_JAN_28", dailyDropperCount: 11500 },
  { id: "6", date: "Jan 27, 2026", dailyDropper: "DAILY_DROPPER_JAN_27", dailyDropperCount: 12800 },
  { id: "7", date: "Jan 26, 2026", dailyDropper: "DAILY_DROPPER_JAN_26", dailyDropperCount: 13500 },
];

export default function DailyDropperTracking() {
  const [data] = useState<DailyDropper[]>(initialData);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createDate, setCreateDate] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(d =>
      d.date.toLowerCase().includes(searchLower) ||
      d.dailyDropper.toLowerCase().includes(searchLower) ||
      String(d.dailyDropperCount).includes(search)
    );
  }, [data, search]);

  const handleExport = () => {
    const csvData = filteredData.map(d => ({
      Date: d.date,
      "Daily Dropper": d.dailyDropper,
      "Daily Dropper Count": d.dailyDropperCount,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily_dropper_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Data exported successfully");
  };

  const handleCreate = async () => {
    if (!createDate) {
      toast.error("Please select a date");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Daily Dropper request triggered successfully");
      setShowCreateModal(false);
      setCreateDate("");
    } catch (error) {
      toast.error("Failed to trigger request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Dropper Tracking</h1>
          <p className="text-muted-foreground mt-1">Track daily dropper segments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg">Daily Dropper Data</CardTitle>
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
                <th className="border border-border px-4 py-3 text-left font-semibold">Daily Dropper</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">Daily Dropper Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{row.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm">{row.dailyDropper}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono">{formatNumber(row.dailyDropperCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No data matching search criteria</div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Daily Dropper Request</DialogTitle>
            <DialogDescription>
              Trigger a new daily dropper calculation for a specific date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={createDate}
                onChange={(e) => setCreateDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
