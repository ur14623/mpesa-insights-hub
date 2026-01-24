import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Gift, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Search,
  Calendar,
  Filter
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

// Mock data
const kpiData = {
  totalTargeted: { value: 15420, previousValue: 14200, trend: "up" },
  totalRewards: { value: 8934, previousValue: 7650, trend: "up" },
  totalRewardAmount: { value: 102741, previousValue: 87975, trend: "up" }
};

const customerSegmentationData = [
  { customerId: "CUS001", rechargeAmount: 75, segment: "50-100 birr", mpesaStatus: "Active", rewardsReceived: 3 },
  { customerId: "CUS002", rechargeAmount: 150, segment: "100+ birr", mpesaStatus: "Inactive", rewardsReceived: 1 },
  { customerId: "CUS003", rechargeAmount: 85, segment: "50-100 birr", mpesaStatus: "Active", rewardsReceived: 5 },
  { customerId: "CUS004", rechargeAmount: 200, segment: "100+ birr", mpesaStatus: "Active", rewardsReceived: 2 },
  { customerId: "CUS005", rechargeAmount: 95, segment: "50-100 birr", mpesaStatus: "Inactive", rewardsReceived: 0 },
  { customerId: "CUS006", rechargeAmount: 120, segment: "100+ birr", mpesaStatus: "Active", rewardsReceived: 4 },
  { customerId: "CUS007", rechargeAmount: 60, segment: "50-100 birr", mpesaStatus: "Active", rewardsReceived: 2 },
  { customerId: "CUS008", rechargeAmount: 180, segment: "100+ birr", mpesaStatus: "Inactive", rewardsReceived: 1 },
];

const rewardUtilizationData = [
  { customerId: "CUS001", rewardsReceived: 3, lastRewardDate: "2024-01-15", totalRewardAmount: 34.5, conversionRate: 85 },
  { customerId: "CUS003", rewardsReceived: 5, lastRewardDate: "2024-01-18", totalRewardAmount: 57.5, conversionRate: 92 },
  { customerId: "CUS004", rewardsReceived: 2, lastRewardDate: "2024-01-10", totalRewardAmount: 23, conversionRate: 70 },
  { customerId: "CUS006", rewardsReceived: 4, lastRewardDate: "2024-01-20", totalRewardAmount: 46, conversionRate: 88 },
  { customerId: "CUS007", rewardsReceived: 2, lastRewardDate: "2024-01-12", totalRewardAmount: 23, conversionRate: 65 },
  { customerId: "CUS002", rewardsReceived: 1, lastRewardDate: "2024-01-05", totalRewardAmount: 11.5, conversionRate: 40 },
];

const behaviorChangeData = [
  { customerId: "CUS001", bankBefore: 5, mpesaBefore: 2, bankAfter: 1, mpesaAfter: 6, behaviorChange: "+200%" },
  { customerId: "CUS003", bankBefore: 8, mpesaBefore: 1, bankAfter: 2, mpesaAfter: 9, behaviorChange: "+800%" },
  { customerId: "CUS004", bankBefore: 3, mpesaBefore: 3, bankAfter: 1, mpesaAfter: 5, behaviorChange: "+67%" },
  { customerId: "CUS006", bankBefore: 6, mpesaBefore: 0, bankAfter: 1, mpesaAfter: 7, behaviorChange: "+700%" },
  { customerId: "CUS007", bankBefore: 4, mpesaBefore: 2, bankAfter: 2, mpesaAfter: 4, behaviorChange: "+100%" },
];

const rewardDistributionChart = [
  { name: "1 reward", value: 1200 },
  { name: "2 rewards", value: 2800 },
  { name: "3 rewards", value: 2100 },
  { name: "4+ rewards", value: 2834 },
];

const segmentDistributionChart = [
  { name: "50-100 birr", value: 6500 },
  { name: "100+ birr", value: 8920 },
];

const behaviorTrendChart = [
  { month: "Oct", bankRecharge: 4500, mpesaRecharge: 1200 },
  { month: "Nov", bankRecharge: 4200, mpesaRecharge: 1800 },
  { month: "Dec", bankRecharge: 3800, mpesaRecharge: 2500 },
  { month: "Jan", bankRecharge: 2900, mpesaRecharge: 4200 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

export default function CCBECampaign() {
  const [activeTab, setActiveTab] = useState("segmentation");
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  const handleExport = (type: string) => {
    console.log(`Exporting ${type} data...`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CCBE Campaign Performance</h1>
          <p className="text-muted-foreground text-sm mt-1">Bank to MPESA recharge conversion campaign analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Campaign Period
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("all")}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Targeted Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalTargeted.value.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">
                +{formatTrend(kpiData.totalTargeted.value, kpiData.totalTargeted.previousValue)}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards Distributed</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalRewards.value.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">
                +{formatTrend(kpiData.totalRewards.value, kpiData.totalRewards.previousValue)}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reward Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalRewardAmount.value.toLocaleString()} birr</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">
                +{formatTrend(kpiData.totalRewardAmount.value, kpiData.totalRewardAmount.previousValue)}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="segmentation">Customer Segmentation</TabsTrigger>
          <TabsTrigger value="utilization">Reward Utilization</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Change Analysis</TabsTrigger>
        </TabsList>

        {/* Customer Segmentation Tab */}
        <TabsContent value="segmentation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Customer Segmentation Analysis</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("segmentation")}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="50-100">50-100 birr</SelectItem>
                    <SelectItem value="100+">100+ birr</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="MPESA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Recharge Amount</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>MPESA Status</TableHead>
                      <TableHead>Rewards Received</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerSegmentationData.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">{customer.customerId}</TableCell>
                        <TableCell>{customer.rechargeAmount} birr</TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.segment}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.mpesaStatus === "Active" ? "default" : "secondary"}>
                            {customer.mpesaStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer.rewardsReceived}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward Utilization Tab */}
        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reward Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={rewardDistributionChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Segment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={segmentDistributionChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {segmentDistributionChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Reward Utilization Details</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("utilization")}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="50-100">50-100 birr</SelectItem>
                    <SelectItem value="100+">100+ birr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Rewards Received</TableHead>
                      <TableHead>Last Reward Date</TableHead>
                      <TableHead>Total Reward Amount</TableHead>
                      <TableHead>Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardUtilizationData.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">{customer.customerId}</TableCell>
                        <TableCell>{customer.rewardsReceived}</TableCell>
                        <TableCell>{customer.lastRewardDate}</TableCell>
                        <TableCell>{customer.totalRewardAmount} birr</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${customer.conversionRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{customer.conversionRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Change Analysis Tab */}
        <TabsContent value="behavior" className="space-y-4">
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bank vs MPESA Recharge Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={behaviorTrendChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bankRecharge" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    name="Bank Recharge"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mpesaRecharge" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="MPESA Recharge"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Behavior Change Analysis</CardTitle>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport("behavior")}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search customers..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="50-100">50-100 birr</SelectItem>
                    <SelectItem value="100+">100+ birr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Bank Before</TableHead>
                      <TableHead>MPESA Before</TableHead>
                      <TableHead>Bank After</TableHead>
                      <TableHead>MPESA After</TableHead>
                      <TableHead>Behavior Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {behaviorChangeData.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">{customer.customerId}</TableCell>
                        <TableCell>{customer.bankBefore}</TableCell>
                        <TableCell>{customer.mpesaBefore}</TableCell>
                        <TableCell>{customer.bankAfter}</TableCell>
                        <TableCell>{customer.mpesaAfter}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {customer.behaviorChange}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
