import type { Database } from "@todo/types";

export type Task =
  Database["public"]["Tables"]["tasks"]["Row"];

export type CreateTaskInput =
  Database["public"]["Tables"]["tasks"]["Insert"];

export type UpdateTaskInput =
  Database["public"]["Tables"]["tasks"]["Update"];