import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteTask } from "../api/tasks";

import {
  optimisticUpdate,
  refreshTasks,
  rollbackTasks,
} from "../utils/optimistic";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    async onMutate(id) {
      return optimisticUpdate(
        queryClient,
        (tasks) =>
          tasks.filter(
            (task) => task.id !== id,
          ),
      );
    },

    onError(_error, _id, context) {
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