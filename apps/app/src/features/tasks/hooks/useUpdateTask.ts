import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";

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
        queryKey,
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
        queryKey,
        context,
      );
    },

    onSettled() {
      refreshTasks(queryClient);
    },
  });
}