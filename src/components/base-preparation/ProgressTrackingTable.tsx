import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TableTrackingStatus {
  tableName: string;
  columns: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  executionTime: number | null;
  rowCount: number | null;
  result: "Success" | "Failed" | null;
}

interface ProgressTrackingTableProps {
  title: string;
  statuses: TableTrackingStatus[];
}

export function ProgressTrackingTable({ title, statuses }: ProgressTrackingTableProps) {
  const getStatusBadge = (status: TableTrackingStatus["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getResultBadge = (result: TableTrackingStatus["result"]) => {
    if (!result) return <span className="text-muted-foreground">—</span>;
    if (result === "Success") {
      return <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Success</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  if (statuses.length === 0) return null;

  return (
    <Card className="border-2 shadow-elegant">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          📊 {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Columns</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Execution Time</TableHead>
                <TableHead>Row Count</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((table, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{table.tableName || "—"}</TableCell>
                  <TableCell>{table.columns.length > 0 ? table.columns.join(", ") : "—"}</TableCell>
                  <TableCell>{getStatusBadge(table.status)}</TableCell>
                  <TableCell>
                    {table.executionTime !== null ? `${table.executionTime}s` : "—"}
                  </TableCell>
                  <TableCell>{table.rowCount?.toLocaleString() || "—"}</TableCell>
                  <TableCell>{getResultBadge(table.result)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
