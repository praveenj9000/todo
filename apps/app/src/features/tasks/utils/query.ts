import type { QueryClient } from "@tanstack/react-query";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import type { Task } from "../types/task";

export async function cancelTasksQuery(
  queryClient: QueryClient,
) {
  await queryClient.cancelQueries({
    queryKey: TASKS_QUERY_KEY,
  });
}

export function getTasksCache(
  queryClient: QueryClient,
) {
  return queryClient.getQueryData<Task[]>(
    TASKS_QUERY_KEY,
  );
}

export function setTasksCache(
  queryClient: QueryClient,
  tasks: Task[],
) {
  queryClient.setQueryData(
    TASKS_QUERY_KEY,
    tasks,
  );
}

export function invalidateTasks(
  queryClient: QueryClient,
) {
  queryClient.invalidateQueries({
    queryKey: TASKS_QUERY_KEY,
  });
}