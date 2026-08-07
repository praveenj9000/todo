import { useInfiniteQuery } from "@tanstack/react-query";

import { getTasksPage } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { TasksCursor } from "../types/task";

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
      }),

    initialPageParam: null as TasksCursor | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}