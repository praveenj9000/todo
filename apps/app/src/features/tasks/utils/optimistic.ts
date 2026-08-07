import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { Task } from "../types/task";

import {
  cancelTasksQuery,
  flattenTasksCache,
  getTasksCache,
  invalidateTasks,
  setTasksCache,
} from "./query";

export type TasksContext = {
  previousTasks: Task[];
};

export async function optimisticUpdate(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updater: (tasks: Task[]) => Task[],
): Promise<TasksContext> {
  await cancelTasksQuery(queryClient);

  const previousTasks = flattenTasksCache(
    getTasksCache(queryClient, queryKey),
  );

  setTasksCache(
    queryClient,
    queryKey,
    updater(previousTasks),
  );

  return {
    previousTasks,
  };
}

export function rollbackTasks(
  queryClient: QueryClient,
  queryKey: QueryKey,
  context?: TasksContext,
) {
  if (!context) {
    return;
  }

  setTasksCache(
    queryClient,
    queryKey,
    context.previousTasks,
  );
}

export function refreshTasks(
  queryClient: QueryClient,
) {
  invalidateTasks(queryClient);
}