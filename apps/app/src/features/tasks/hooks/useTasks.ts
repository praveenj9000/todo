import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";

export function useTasks() {
  const {
    filter,
    sort,
  } = useTasksStore();

  return useQuery({
    queryKey: [
      ...TASKS_QUERY_KEY,
      filter,
      sort,
    ],

    queryFn: () =>
      getTasks({
        filter,
        sort,
      }),
  });
}