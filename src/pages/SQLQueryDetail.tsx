import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSQLQueryById, updateSQLQuery, deleteSQLQuery, type SQLQueryFromApi } from "@/lib/sqlLibraryApi";

// SQL syntax highlighting
const highlightSQL = (sql: string) => {
  const keywords = /\b(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|TRUNC|SUBSTR|WITH|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TABLE|VIEW|LEVEL|CONNECT BY|DUAL|SYSDATE|PARTITION BY|ROW_NUMBER|OVER|DESC|ASC)\b/gi;
  const strings = /('[^']*')/g;
  const comments = /(--.*$|\/\*[\s\S]*?\*\/)/gm;
  
  let highlighted = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  highlighted = highlighted.replace(comments, '<span class="text-muted-foreground italic">$1</span>');
  highlighted = highlighted.replace(strings, '<span class="text-green-400">$1</span>');
  highlighted = highlighted.replace(keywords, '<span class="text-primary font-semibold">$1</span>');
  
  return highlighted;
};

export default function SQLQueryDetail() {
  const { queryId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState<SQLQueryFromApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", sql: "" });

  useEffect(() => {
    const fetchQuery = async () => {
      if (!queryId) return;
      setIsLoading(true);
      try {
        const response = await getSQLQueryById(Number(queryId));
        if (response.success && response.data && response.data.length > 0) {
          const q = response.data[0];
          setQuery(q);
          setEditForm({ title: q.title, description: q.description, sql: q.sql_text });
        } else {
          toast.error("Query not found");
        }
      } catch (error) {
        console.error("Error fetching query:", error);
        toast.error("Failed to connect to the server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuery();
  }, [queryId]);

  const handleCopySQL = () => {
    if (query) {
      navigator.clipboard.writeText(query.sql_text);
      toast.success("SQL copied to clipboard");
    }
  };

  const handleEdit = async () => {
    if (!query || !editForm.title.trim() || !editForm.sql.trim()) {
      toast.error("Title and SQL are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateSQLQuery({
        id: query.id,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        sql: editForm.sql.trim(),
      });

      if (response.success) {
        toast.success("Query updated successfully");
        setIsEditOpen(false);
        // Refresh the query
        const refreshResponse = await getSQLQueryById(query.id);
        if (refreshResponse.success && refreshResponse.data && refreshResponse.data.length > 0) {
          setQuery(refreshResponse.data[0]);
        }
      } else {
        toast.error(response.error || "Failed to update query");
      }
    } catch (error) {
      console.error("Error updating query:", error);
      toast.error("Failed to connect to the server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!query) return;

    setIsSaving(true);
    try {
      const response = await deleteSQLQuery(query.id);
      if (response.success) {
        toast.success("Query deleted successfully");
        navigate("/sql-query-library");
      } else {
        toast.error(response.error || "Failed to delete query");
      }
    } catch (error) {
      console.error("Error deleting query:", error);
      toast.error("Failed to connect to the server");
    } finally {
      setIsSaving(false);
      setIsDeleteOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/sql-query-library")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Loading query...</p>
        </Card>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/sql-query-library")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">SQL Query not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sql-query-library")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{query.title}</h1>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{query.description || "No description provided."}</p>
        </CardContent>
      </Card>

      {/* SQL Code */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">SQL Code</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopySQL}>
              <Copy className="h-4 w-4 mr-2" />
              Copy SQL
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              <code dangerouslySetInnerHTML={{ __html: highlightSQL(query.sql_text) }} />
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SQL Query</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input 
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sql">SQL *</Label>
              <Textarea 
                id="edit-sql"
                value={editForm.sql}
                onChange={(e) => setEditForm({ ...editForm, sql: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Query</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{query.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
