import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTasksPageOffset } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";

export function useTasksPaged() {
  const { filter, sort, page, pageSize } = useTasksStore();

  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, "paged", filter, sort, page, pageSize],

    queryFn: () =>
      getTasksPageOffset({
        filter,
        sort,
        page,
        pageSize,
      }),

    placeholderData: keepPreviousData,
  });
}
