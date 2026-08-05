import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateTask } from "../api/tasks";

import type { UpdateTask } from "../types/task";

import {
  optimisticUpdate,
  refreshTasks,
  rollbackTasks,
} from "../utils/optimistic";

type UpdateTaskInput = {
  id: string;
  updates: UpdateTask;
};

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: UpdateTaskInput) =>
      updateTask(id, updates),

    async onMutate({
      id,
      updates,
    }) {
      return optimisticUpdate(
        queryClient,
        (tasks) =>
          tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                }
              : task,
          ),
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