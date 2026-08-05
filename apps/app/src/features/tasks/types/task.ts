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

export type GetTasksInput = {
  filter: TaskFilter;
  sort: TaskSort;
};