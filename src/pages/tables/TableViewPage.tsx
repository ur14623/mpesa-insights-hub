import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Database, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface TableSampleResponse {
  success: boolean;
  table_name: string;
  schema: string;
  columns: string[];
  data: Record<string, any>[];
  sample_size: number;
  total_rows: number;
}

export default function TableViewPage() {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(tableName || "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableSampleResponse | null>(null);

  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/get_table_sample", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table_name: decodedName }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TableSampleResponse = await response.json();
        
        if (!data.success) {
          throw new Error("Failed to fetch table data");
        }
        
        setTableData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (decodedName) {
      fetchTableData();
    }
  }, [decodedName]);

  const columns = tableData?.columns || [];
  const rows = tableData?.data || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{decodedName}</h1>
          <p className="text-muted-foreground">
            {tableData ? `Schema: ${tableData.schema} • Total rows: ${tableData.total_rows.toLocaleString()}` : "Loading..."}
          </p>
        </div>
      </div>

      <Card className="border-2 shadow-elegant">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SELECT * FROM {decodedName} (Top 10)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading table data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead 
                          key={col} 
                          className="whitespace-nowrap font-semibold bg-muted/50"
                          style={{ minWidth: Math.max(100, col.length * 10) }}
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        {columns.map((col) => (
                          <TableCell 
                            key={col} 
                            className="whitespace-nowrap font-mono text-sm"
                          >
                            {row[col] ?? "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Showing {rows.length} of {tableData?.total_rows.toLocaleString()} rows (read-only view)
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
