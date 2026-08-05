import type { QueryClient } from "@tanstack/react-query";

import type { Task } from "../types/task";

import {
  cancelTasksQuery,
  getTasksCache,
  invalidateTasks,
  setTasksCache,
} from "./query";

export type TasksContext = {
  previousTasks: Task[];
};

export async function optimisticUpdate(
  queryClient: QueryClient,
  updater: (tasks: Task[]) => Task[],
): Promise<TasksContext> {
  await cancelTasksQuery(queryClient);

  const previousTasks =
    getTasksCache(queryClient) ?? [];

  setTasksCache(
    queryClient,
    updater(previousTasks),
  );

  return {
    previousTasks,
  };
}

export function rollbackTasks(
  queryClient: QueryClient,
  context?: TasksContext,
) {
  if (!context) {
    return;
  }

  setTasksCache(
    queryClient,
    context.previousTasks,
  );
}

export function refreshTasks(
  queryClient: QueryClient,
) {
  invalidateTasks(queryClient);
}