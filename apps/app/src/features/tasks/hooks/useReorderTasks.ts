import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { reorderTasks } from "../api/tasks";

import type { Task } from "../types/task";

import {
  optimisticUpdate,
  refreshTasks,
  rollbackTasks,
} from "../utils/optimistic";

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderTasks,

    async onMutate(taskIds) {
      return optimisticUpdate(
        queryClient,
        (tasks) =>
          taskIds
            .map((id) =>
              tasks.find(
                (task) => task.id === id,
              ),
            )
            .filter(
              (
                task,
              ): task is Task =>
                task !== undefined,
            )
            .map(
              (
                task,
                sort_order,
              ) => ({
                ...task,
                sort_order,
              }),
            ),
      );
    },

    onError(_error, _ids, context) {
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