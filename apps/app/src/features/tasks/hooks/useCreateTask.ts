import { useOptimisticListMutation } from "@todo/query-toolkit";

import { createTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { NewTask, Task, TasksCursor, TasksPage } from "../types/task";

const accessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

export function useCreateTask() {
  const { filter, sort } = useTasksStore();

  return useOptimisticListMutation<Task, TasksPage, TasksCursor | null, Pick<NewTask, "title">>({
    queryKey: [...TASKS_QUERY_KEY, filter, sort],
    mutationFn: createTask,
    accessor,
    emptyPage: { tasks: [], nextCursor: null },
    emptyPageParam: null,
    updateItems: (items, input) => [
      {
        id: crypto.randomUUID(),
        user_id: "",
        title: input.title,
        completed: false,
        completed_at: null,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...items,
    ],
  });
}