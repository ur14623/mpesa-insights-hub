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

interface ThirtyDayDropper {
  id: string;
  date: string;
  thirtyDayDropper: string;
  thirtyDayDropperCount: number;
}

const initialData: ThirtyDayDropper[] = [
  { id: "1", date: "Feb 01, 2026", thirtyDayDropper: "30D_DROPPER_FEB_01", thirtyDayDropperCount: 45230 },
  { id: "2", date: "Jan 31, 2026", thirtyDayDropper: "30D_DROPPER_JAN_31", thirtyDayDropperCount: 44100 },
  { id: "3", date: "Jan 30, 2026", thirtyDayDropper: "30D_DROPPER_JAN_30", thirtyDayDropperCount: 46500 },
  { id: "4", date: "Jan 29, 2026", thirtyDayDropper: "30D_DROPPER_JAN_29", thirtyDayDropperCount: 43800 },
  { id: "5", date: "Jan 28, 2026", thirtyDayDropper: "30D_DROPPER_JAN_28", thirtyDayDropperCount: 42500 },
  { id: "6", date: "Jan 27, 2026", thirtyDayDropper: "30D_DROPPER_JAN_27", thirtyDayDropperCount: 47200 },
  { id: "7", date: "Jan 26, 2026", thirtyDayDropper: "30D_DROPPER_JAN_26", thirtyDayDropperCount: 48100 },
];

export default function ThirtyDayDropperTracking() {
  const [data] = useState<ThirtyDayDropper[]>(initialData);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createDate, setCreateDate] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(d =>
      d.date.toLowerCase().includes(searchLower) ||
      d.thirtyDayDropper.toLowerCase().includes(searchLower) ||
      String(d.thirtyDayDropperCount).includes(search)
    );
  }, [data, search]);

  const handleExport = () => {
    const csvData = filteredData.map(d => ({
      Date: d.date,
      "30D Dropper": d.thirtyDayDropper,
      "30D Dropper Count": d.thirtyDayDropperCount,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `30d_dropper_${format(new Date(), "yyyy-MM-dd")}.csv`;
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
      toast.success("30-Day Dropper request triggered successfully");
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
          <h1 className="text-2xl font-bold">30-Day Dropper Tracking</h1>
          <p className="text-muted-foreground mt-1">Track 30-day dropper segments</p>
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
            <CardTitle className="text-lg">30-Day Dropper Data</CardTitle>
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
                <th className="border border-border px-4 py-3 text-left font-semibold">30D Dropper</th>
                <th className="border border-border px-4 py-3 text-right font-semibold">30D Dropper Count</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20">
                  <td className="border border-border px-4 py-2 font-medium">{row.date}</td>
                  <td className="border border-border px-4 py-2 font-mono text-sm">{row.thirtyDayDropper}</td>
                  <td className="border border-border px-4 py-2 text-right font-mono">{formatNumber(row.thirtyDayDropperCount)}</td>
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
            <DialogTitle>Create 30-Day Dropper Request</DialogTitle>
            <DialogDescription>
              Trigger a new 30-day dropper calculation for a specific date.
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
