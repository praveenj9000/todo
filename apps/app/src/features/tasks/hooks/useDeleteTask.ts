import { useOptimisticListMutation } from "@todo/query-toolkit";

import { deleteTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksCursor, TasksPage } from "../types/task";

const accessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

export function useDeleteTask() {
  const { filter, sort } = useTasksStore();

  return useOptimisticListMutation<Task, TasksPage, TasksCursor | null, string>({
    queryKey: [...TASKS_QUERY_KEY, filter, sort],
    mutationFn: deleteTask,
    accessor,
    emptyPage: { tasks: [], nextCursor: null },
    emptyPageParam: null,
    updateItems: (items, id) => items.filter((task) => task.id !== id),
  });
}
