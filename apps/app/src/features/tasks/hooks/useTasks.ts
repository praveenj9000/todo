import { useInfiniteQuery } from "@tanstack/react-query";

import { FEATURES } from "@/config/features";

import { getTasksPage } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import { useListsStore } from "@/features/lists/stores/lists-ui.store";
import type { TasksCursor } from "../types/task";

const PAGE_SIZE = FEATURES.pagination.enabled
  ? FEATURES.pagination.pageSize
  : Number.MAX_SAFE_INTEGER;

export function useTasks() {
  const { filter, sort } = useTasksStore();
  const selectedListId = useListsStore((state) => state.selectedListId);

  return useInfiniteQuery({
    queryKey: [...TASKS_QUERY_KEY, selectedListId, filter, sort],
    enabled: Boolean(selectedListId),
    queryFn: ({ pageParam }) =>
      getTasksPage({
        filter,
        sort,
        cursor: pageParam,
        limit: PAGE_SIZE,
        listId: selectedListId ?? undefined,
      }),

    initialPageParam: null as TasksCursor | null,

    getNextPageParam: (lastPage) => (FEATURES.pagination.enabled ? lastPage.nextCursor : null),
  });
}
