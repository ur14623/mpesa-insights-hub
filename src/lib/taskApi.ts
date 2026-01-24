const BASE_URL = "http://127.0.0.1:5000";

export interface TaskData {
  task_id: number;
  task_name: string;
  date_submitted: string;
  date_completed: string | null;
  status: "NEW" | "COMPLETED";
  created_date: string;
  last_updated: string;
}

export interface TasksResponse {
  success: boolean;
  total_tasks: number;
  new_tasks: number;
  completed_tasks: number;
  data: TaskData[];
}

export interface AddTaskResponse {
  success: boolean;
  message: string;
  task_id: number;
  task_name: string;
  status: string;
  action: string;
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  task_id: number;
  task_name: string;
  previous_status: string;
  new_status: string;
  date_completed: string;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
  task_id: number;
  task_name: string;
  status_at_deletion: string;
}

export async function getTasks(params?: { task_id?: number; status?: string }): Promise<TasksResponse> {
  const url = new URL(`${BASE_URL}/task/get`);
  if (params?.task_id) url.searchParams.append("task_id", params.task_id.toString());
  if (params?.status) url.searchParams.append("status", params.status);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const json = await response.json();
  
  // Map uppercase API fields to lowercase frontend fields
  return {
    ...json,
    data: json.data?.map((task: any) => ({
      task_id: task.TASK_ID,
      task_name: task.TASK_NAME,
      date_submitted: task.DATE_SUBMITTED,
      date_completed: task.DATE_COMPLETED,
      status: task.STATUS,
      created_date: task.CREATED_DATE,
      last_updated: task.LAST_UPDATED,
    })) || [],
  };
}

export async function addTask(task_name: string): Promise<AddTaskResponse> {
  const response = await fetch(`${BASE_URL}/task/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_name }),
  });

  if (!response.ok) {
    throw new Error("Failed to add task");
  }
  return response.json();
}

export async function updateTaskStatus(task_id: number, status: "NEW" | "COMPLETED"): Promise<UpdateStatusResponse> {
  const response = await fetch(`${BASE_URL}/task/update_status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_id, status }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to update task status");
  }
  return data;
}

export async function deleteTask(task_id: number): Promise<DeleteTaskResponse> {
  const response = await fetch(`${BASE_URL}/task/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_id }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to delete task");
  }
  return data;
}
