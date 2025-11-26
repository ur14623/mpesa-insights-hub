import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateDailyData, generateMonthlyData, calculateSum, calculateMean, formatNumber } from "@/utils/mockData";

interface MetricCardProps {
  title: string;
}

type FilterType = "daily" | "30-day" | "90-day";

const MetricCard = ({ title }: MetricCardProps) => {
  const [filter, setFilter] = useState<FilterType>("daily");

  const getData = () => {
    switch (filter) {
      case "daily":
        return generateDailyData(7);
      case "30-day":
        return generateDailyData(30);
      case "90-day":
        return generateMonthlyData(3);
      default:
        return generateDailyData(7);
    }
  };

  const data = getData();
  const cardValue = filter === "daily" ? data[data.length - 1].value : calculateSum(data);
  const showMean = filter === "30-day";
  const meanValue = showMean ? calculateMean(data) : 0;

  const handleExport = () => {
    console.log(`Exporting ${title} - ${filter}`);
    // Export functionality would be implemented here
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="30-day">30-Day</SelectItem>
            <SelectItem value="90-day">90-Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
          <TabsTrigger value="card" className="text-xs">Card</TabsTrigger>
          <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 10 }}
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
              {showMean && <ReferenceLine y={meanValue} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="card" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center h-[200px] bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                {filter === "daily" ? "Today's Value" : `Total (Last ${filter === "30-day" ? "30" : "90"} Days)`}
              </p>
              <p className="text-3xl font-bold text-primary">{formatNumber(cardValue)}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[200px] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-xs">{row.date}</TableCell>
                    <TableCell className="text-xs text-right">{formatNumber(row.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default MetricCard;
