import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createTask } from "../api/tasks";

import type { Task } from "../types/task";

import {
  optimisticUpdate,
  refreshTasks,
  rollbackTasks,
} from "../utils/optimistic";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    async onMutate(input) {
      return optimisticUpdate(
        queryClient,
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
        context,
      );
    },

    onSettled() {
      refreshTasks(queryClient);
    },
  });
}