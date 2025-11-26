import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import SummaryCard from "@/components/metric/SummaryCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateDailyData, generateMonthlyData, calculateSum, calculateMean, formatNumber } from "@/utils/mockData";

type FilterType = "daily" | "30-day" | "90-day" | "custom";

const MetricDetail = () => {
  const { metric } = useParams();
  const [filter, setFilter] = useState<FilterType>("daily");

  const metricTitle = metric?.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ") || "Metric";

  const getData = () => {
    switch (filter) {
      case "daily":
        return generateDailyData(7);
      case "30-day":
        return generateDailyData(30);
      case "90-day":
      case "custom":
        return generateMonthlyData(3);
      default:
        return generateDailyData(7);
    }
  };

  const data = getData();
  const dailyData = generateDailyData(1);
  const thirtyDayData = generateDailyData(30);
  const ninetyDayData = generateMonthlyData(3);

  const showMean = filter === "30-day";
  const meanValue = showMean ? calculateMean(data) : 0;

  const handleExport = () => {
    console.log(`Exporting ${metricTitle} - ${filter}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{metricTitle}</h1>
          <p className="text-muted-foreground mt-1">Detailed view with filters and analysis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard 
            title="Daily" 
            value={dailyData[0].value}
            subtitle="Today's value"
          />
          <SummaryCard 
            title="30-Day" 
            value={calculateSum(thirtyDayData)}
            subtitle="Sum of last 30 days"
          />
          <SummaryCard 
            title="90-Day" 
            value={calculateSum(ninetyDayData)}
            subtitle="Sum of last 90 days"
          />
        </div>

        {/* Chart and Table Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Detailed Analysis</h2>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (7 days)</SelectItem>
                  <SelectItem value="30-day">30-Day</SelectItem>
                  <SelectItem value="90-day">90-Day</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {filter === "custom" && (
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Select Dates
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Chart
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  {showMean && (
                    <ReferenceLine 
                      y={meanValue} 
                      stroke="hsl(var(--accent))" 
                      strokeDasharray="3 3"
                      label={{ value: `Mean: ${formatNumber(Math.round(meanValue))}`, position: "top" }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Table
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
};

export default MetricDetail;
