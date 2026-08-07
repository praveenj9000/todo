import { useInfiniteQuery } from "@tanstack/react-query";

import { FEATURES } from "@/config/features";

import { getTasksPage } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { TasksCursor } from "../types/task";

const PAGE_SIZE = FEATURES.pagination.enabled
  ? FEATURES.pagination.pageSize
  : Number.MAX_SAFE_INTEGER;

export function useTasks() {
  const {
    filter,
    sort,
  } = useTasksStore();

  return useInfiniteQuery({
    queryKey: [
      ...TASKS_QUERY_KEY,
      filter,
      sort,
    ],

    queryFn: ({ pageParam }) =>
      getTasksPage({
        filter,
        sort,
        cursor: pageParam,
        limit: PAGE_SIZE,
      }),

    initialPageParam: null as TasksCursor | null,

    getNextPageParam: (lastPage) =>
      FEATURES.pagination.enabled ? lastPage.nextCursor : null,
  });
}