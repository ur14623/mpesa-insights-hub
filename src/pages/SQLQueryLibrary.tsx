import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileCode2, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { getSQLQueries, saveSQLQuery, type SQLQueryFromApi } from "@/lib/sqlLibraryApi";

export interface SQLQuery {
  id: string;
  title: string;
  description: string;
  sql: string;
  type: string;
  createdAt: Date;
}

export default function SQLQueryLibrary() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<SQLQueryFromApi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newQuery, setNewQuery] = useState({ title: "", description: "", sql: "" });
  const searchRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch queries from API
  useEffect(() => {
    const fetchQueries = async () => {
      setIsLoading(true);
      try {
        const response = await getSQLQueries(debouncedSearch || undefined);
        if (response.success && response.data) {
          setQueries(response.data);
        } else {
          toast.error(response.error || "Failed to fetch queries");
        }
      } catch (error) {
        console.error("Error fetching queries:", error);
        toast.error("Failed to connect to the server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, [debouncedSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || queries.length === 0) return [];
    const term = searchTerm.toLowerCase();
    return queries
      .filter(q => q.title.toLowerCase().includes(term))
      .slice(0, 5);
  }, [searchTerm, queries]);

  // Pagination
  const totalPages = Math.ceil(queries.length / itemsPerPage);
  const paginatedQueries = queries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectSuggestion = (query: SQLQueryFromApi) => {
    setSearchTerm(query.title);
    setShowSuggestions(false);
  };

  const handleAddQuery = async () => {
    if (!newQuery.title.trim() || !newQuery.sql.trim()) {
      toast.error("Title and SQL are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveSQLQuery({
        title: newQuery.title.trim(),
        description: newQuery.description.trim(),
        sql: newQuery.sql.trim(),
      });

      if (response.success) {
        toast.success(response.message || "SQL query added successfully");
        setNewQuery({ title: "", description: "", sql: "" });
        setIsDialogOpen(false);
        // Refresh the list
        const refreshResponse = await getSQLQueries(debouncedSearch || undefined);
        if (refreshResponse.success && refreshResponse.data) {
          setQueries(refreshResponse.data);
        }
      } else {
        toast.error(response.error || "Failed to save query");
      }
    } catch (error) {
      console.error("Error saving query:", error);
      toast.error("Failed to connect to the server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SQL Query Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and manage stored SQL queries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add SQL Query
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New SQL Query</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title"
                  placeholder="Enter query title..."
                  value={newQuery.title}
                  onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter query description..."
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sql">SQL *</Label>
                <Textarea 
                  id="sql"
                  placeholder="Enter SQL query..."
                  value={newQuery.sql}
                  onChange={(e) => setNewQuery({ ...newQuery, sql: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddQuery} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Query
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-9"
        />
        {/* Auto-suggestion dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
            {suggestions.map((query) => (
              <button
                key={query.id}
                onClick={() => handleSelectSuggestion(query)}
                className="w-full px-4 py-2 text-left hover:bg-accent text-sm transition-colors first:rounded-t-md last:rounded-b-md"
              >
                <span className="font-medium">{query.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Query Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading queries...</p>
          </div>
        ) : queries.length === 0 ? (
          <div className="p-8 text-center">
            <FileCode2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No SQL queries found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Title</TableHead>
                <TableHead className="font-semibold text-foreground text-right w-[150px]">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQueries.map((query, index) => (
                <TableRow 
                  key={query.id}
                  onClick={() => navigate(`/sql-query/${query.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <TableCell className="font-medium text-foreground py-4">
                    {query.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right py-4">
                    {query.date_created ? format(new Date(query.date_created), "MMM dd, yyyy") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, queries.length)} of {queries.length} queries
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
