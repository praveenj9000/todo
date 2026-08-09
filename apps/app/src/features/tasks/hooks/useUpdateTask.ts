import { useOptimisticListMutation } from "@todo/query-toolkit";

import { updateTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { TASK_MUTATION_KEYS } from "../constants/mutation-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksCursor, TasksPage, UpdateTask } from "../types/task";

type UpdateTaskInput = { id: string; updates: UpdateTask };

const accessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

export function useUpdateTask() {
  const { filter, sort } = useTasksStore();

  return useOptimisticListMutation<Task, TasksPage, TasksCursor | null, UpdateTaskInput>({
    mutationKey: TASK_MUTATION_KEYS.update,
    queryKey: [...TASKS_QUERY_KEY, filter, sort],
    mutationFn: ({ id, updates }) => updateTask(id, updates),
    accessor,
    emptyPage: { tasks: [], nextCursor: null },
    emptyPageParam: null,
    updateItems: (items, { id, updates }) =>
      items.map((task) => (task.id === id ? { ...task, ...updates } : task)),
  });
}
