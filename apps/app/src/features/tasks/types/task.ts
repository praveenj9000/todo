import type { Database } from "@todo/types";
import type {
  TaskFilter,
  TaskSort,
} from "../constants/tasks";

export type Task =
  Database["public"]["Tables"]["tasks"]["Row"];

export type NewTask =
  Database["public"]["Tables"]["tasks"]["Insert"];

export type UpdateTask =
  Database["public"]["Tables"]["tasks"]["Update"];

export type TasksCursor = {
  primary: string | number;
  id: string;
};

export type TasksPage = {
  tasks: Task[];
  nextCursor: TasksCursor | null;
};

export type GetTasksPageInput = {
  filter: TaskFilter;
  sort: TaskSort;
  cursor: TasksCursor | null;
  limit?: number;
};

export type MoveTaskInput = {
  taskId: string;
  prevId: string | null;
  nextId: string | null;
};