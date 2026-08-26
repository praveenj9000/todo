import type { Database } from "@todo/types";
import type { TaskFilter, TaskSort } from "../constants/tasks";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];

export type NewTask = Database["public"]["Tables"]["tasks"]["Insert"];

export type UpdateTask = Database["public"]["Tables"]["tasks"]["Update"];

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
  listId?: string;
};

export type MoveTaskInput = {
  taskId: string;
  prevId: string | null;
  nextId: string | null;
};

export type GetTasksPageOffsetInput = {
  filter: TaskFilter;
  sort: TaskSort;
  page: number;
  pageSize: number;
  listId?: string;
};

export type TasksOffsetPage = {
  tasks: Task[];
  totalCount: number;
};

export type TaskRelation = "origin" | "sibling" | "child";

export type RelatedTask = {
  task: Task;
  /** Distance from the true root of the tree — 0 for the root itself, 1 for its direct children, etc. Shared by every task at the same level, not just the viewed task's ancestors. */
  depth: number;
  /** True if this task is a direct ancestor of the task being viewed (i.e. on the path from the viewed task up to the root). */
  isAncestor: boolean;
};

export type RelatedTaskTree = {
  items: RelatedTask[];
  /** The true root task of the tree (depth 0) — used as the scroll target for the in-panel "jump to root 0" button. Null if the viewed task has no links at all. */
  root0TaskId: string | null;
};
