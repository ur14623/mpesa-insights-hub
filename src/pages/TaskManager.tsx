import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getTasks, addTask, updateTaskStatus, deleteTask, TaskData } from "@/lib/taskApi";

const TaskManager = () => {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [taskName, setTaskName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "NEW" | "COMPLETED">("ALL");
  
  // Delete confirmation state
  const [deletingTask, setDeletingTask] = useState<TaskData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats
  const [totalTasks, setTotalTasks] = useState(0);
  const [newTasks, setNewTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : undefined;
      const response = await getTasks(params);
      if (response.success) {
        setTasks(response.data);
        setTotalTasks(response.total_tasks);
        setNewTasks(response.new_tasks);
        setCompletedTasks(response.completed_tasks);
      }
    } catch (error) {
      toast.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleAddTask = async () => {
    if (!taskName.trim()) return;

    setIsAdding(true);
    try {
      const response = await addTask(taskName.trim());
      if (response.success) {
        toast.success("Task added successfully");
        setTaskName("");
        fetchTasks();
      }
    } catch (error) {
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (task: TaskData) => {
    const newStatus = task.status === "NEW" ? "COMPLETED" : "NEW";
    try {
      await updateTaskStatus(task.task_id, newStatus);
      toast.success(`Task marked as ${newStatus.toLowerCase()}`);
      fetchTasks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update task status");
    }
  };

  const handleDeleteTask = (task: TaskData) => {
    setDeletingTask(task);
  };

  const confirmDelete = async () => {
    if (!deletingTask) return;
    
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.task_id);
      toast.success("Task deleted successfully");
      setDeletingTask(null);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTodo className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
            <p className="text-sm text-muted-foreground">Create and track your tasks</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTasks} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Tasks</p>
                <p className="text-2xl font-bold">{newTasks}</p>
              </div>
              <Circle className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Task Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">
                Task Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddTask}
                disabled={!taskName.trim() || isAdding}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Tasks</CardTitle>
            <div className="flex gap-2">
              {(["ALL", "NEW", "COMPLETED"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No tasks found</p>
              <p className="text-sm mt-1">
                {statusFilter !== "ALL" 
                  ? `No ${statusFilter.toLowerCase()} tasks. Try a different filter.`
                  : "Create your first task using the form above!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.task_id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                    task.status === "COMPLETED" 
                      ? "bg-muted/30 border-muted" 
                      : "bg-card border-border hover:border-primary/30"
                  )}
                >
                  <Checkbox
                    checked={task.status === "COMPLETED"}
                    onCheckedChange={() => handleToggleStatus(task)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "font-medium",
                        task.status === "COMPLETED" && "line-through text-muted-foreground"
                      )}>
                        {task.task_name}
                      </span>
                      <Badge 
                        variant={task.status === "COMPLETED" ? "secondary" : "default"}
                        className={cn(
                          "text-xs",
                          task.status === "COMPLETED" 
                            ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                            : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {task.status === "COMPLETED" ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</>
                        ) : (
                          <><Circle className="h-3 w-3 mr-1" /> New</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {formatDate(task.date_submitted)}
                      {task.date_completed && (
                        <> • Completed: {formatDate(task.date_completed)}</>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteTask(task)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{deletingTask?.task_name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManager;
