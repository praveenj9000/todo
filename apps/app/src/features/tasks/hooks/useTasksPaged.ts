import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTasksPageOffset } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import { useListsStore } from "@/features/lists/stores/lists-ui.store";

export function useTasksPaged() {
  const { filter, sort, page, pageSize } = useTasksStore();
  const selectedListId = useListsStore((state) => state.selectedListId);

  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "paged", selectedListId, filter, sort, page, pageSize],
    enabled: Boolean(selectedListId),
    queryFn: () =>
      getTasksPageOffset({
        filter,
        sort,
        page,
        pageSize,
        listId: selectedListId ?? undefined,
      }),

    placeholderData: keepPreviousData,
  });
}
