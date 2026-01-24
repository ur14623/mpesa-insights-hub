import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Pause, RefreshCw, Eye, Settings } from "lucide-react";

const flowConfigs: Record<string, { title: string; description: string }> = {
  "ga-flow-up": { 
    title: "GA Flow Up", 
    description: "Manage GA Flow Up campaign flows and automation" 
  },
  "droper": { 
    title: "DROPER", 
    description: "Manage DROPER campaign flows and customer targeting" 
  },
  "unutilized-balance": { 
    title: "Unutilized Balance", 
    description: "Track and manage unutilized balance campaigns" 
  },
  "not-pin-seter": { 
    title: "NOT PIN SETER", 
    description: "Manage campaigns for customers who haven't set their PIN" 
  },
  "cbe2mpesa": { 
    title: "CBE2MPESA", 
    description: "Manage CBE to M-Pesa transfer campaign flows" 
  },
  "churn-win-back": { 
    title: "Churn Win Back", 
    description: "Win back churned customers with targeted campaigns" 
  },
  "dormant-activation": { 
    title: "Dormant Activation", 
    description: "Activate dormant customers through engagement flows" 
  },
  "pin-unlock": { 
    title: "PIN UNLOCK", 
    description: "Manage PIN unlock assistance campaign flows" 
  },
};

// Mock flow data
const mockFlows = [
  { id: "flow_001", name: "Primary Flow", status: "Active", lastRun: "2024-01-15 14:30", success: 95.2, records: 15420 },
  { id: "flow_002", name: "Secondary Flow", status: "Active", lastRun: "2024-01-15 12:00", success: 92.8, records: 8750 },
  { id: "flow_003", name: "Retry Flow", status: "Paused", lastRun: "2024-01-14 18:45", success: 88.5, records: 3200 },
  { id: "flow_004", name: "Cleanup Flow", status: "Active", lastRun: "2024-01-15 08:00", success: 99.1, records: 1250 },
];

export default function CVMFlowPage() {
  const { flowType } = useParams<{ flowType: string }>();
  const config = flowConfigs[flowType || ""] || { title: "Unknown Flow", description: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{config.title}</h1>
        <p className="text-muted-foreground">{config.description}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,620</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">93.9%</div>
          </CardContent>
        </Card>
      </div>

      {/* Flows Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flow List</CardTitle>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flow ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFlows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-mono text-sm">{flow.id}</TableCell>
                  <TableCell className="font-medium">{flow.name}</TableCell>
                  <TableCell>
                    <Badge variant={flow.status === "Active" ? "default" : "secondary"}>
                      {flow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{flow.lastRun}</TableCell>
                  <TableCell>
                    <span className={flow.success >= 95 ? "text-green-600" : flow.success >= 90 ? "text-yellow-600" : "text-red-600"}>
                      {flow.success}%
                    </span>
                  </TableCell>
                  <TableCell>{flow.records.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {flow.status === "Active" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
