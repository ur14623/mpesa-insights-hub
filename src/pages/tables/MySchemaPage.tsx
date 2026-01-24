import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const API_BASE_URL = "http://127.0.0.1:5000";

interface TableData {
  Table_Name: string;
  Created_From: string;
  Date_Created: string;
  Columns_Used: string;
  Row_Count: number;
}

interface ApiResponse {
  success: boolean;
  table_name: string;
  total_records: number;
  columns: string[];
  data: TableData[];
}

export default function MySchemaPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_cvm_portal_data`);
      const data: ApiResponse = await response.json();
      if (data.success) {
        setTables(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tables",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = useMemo(() => {
    return tables.filter(table =>
      table.Table_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.Created_From.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tables, searchQuery]);

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          My Schema
        </h1>
        <p className="text-muted-foreground mt-1">View all tables in your schema</p>
      </div>

      <Card className="border-2 shadow-elegant">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Schema Tables
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search and Refresh */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchTables}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Created From</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Columns Used</TableHead>
                  <TableHead className="text-right">Row Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedTables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No tables found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTables.map((table) => (
                    <TableRow key={table.Table_Name}>
                      <TableCell className="font-medium">{table.Table_Name}</TableCell>
                      <TableCell>{table.Created_From}</TableCell>
                      <TableCell>{table.Date_Created}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={table.Columns_Used}>
                        {table.Columns_Used}
                      </TableCell>
                      <TableCell className="text-right">{table.Row_Count.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
