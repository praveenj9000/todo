import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";

import type { Task } from "../types/task";

import {
  optimisticUpdate,
  refreshTasks,
  rollbackTasks,
} from "../utils/optimistic";

export function useCreateTask() {
  const queryClient = useQueryClient();

  const {
    filter,
    sort,
  } = useTasksStore();

  const queryKey = [
    ...TASKS_QUERY_KEY,
    filter,
    sort,
  ];

  return useMutation({
    mutationFn: createTask,

    async onMutate(input) {
      return optimisticUpdate(
        queryClient,
        queryKey,
        (tasks) => {
          const optimisticTask: Task = {
            id: crypto.randomUUID(),
            user_id: "",
            title: input.title,
            completed: false,
            completed_at: null,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return [
            optimisticTask,
            ...tasks,
          ];
        },
      );
    },

    onError(_error, _input, context) {
      rollbackTasks(
        queryClient,
        queryKey,
        context,
      );
    },

    onSettled() {
      refreshTasks(queryClient);
    },
  });
}