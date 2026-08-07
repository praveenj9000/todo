import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { moveTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { MoveTaskInput, Task } from "../types/task";

import {
  optimisticUpdate,
  rollbackTasks,
} from "../utils/optimistic";

import { resetTasksToFirstPage } from "../utils/query";

type MoveTaskVariables = MoveTaskInput & {
  items: Task[];
};

export function useMoveTask() {
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
      taskId,
      prevId,
      nextId,
    }: MoveTaskVariables) =>
      moveTask({
        taskId,
        prevId,
        nextId,
      }),

    async onMutate({ items }) {
      return optimisticUpdate(
        queryClient,
        queryKey,
        () => items,
      );
    },

    onError(_error, _vars, context) {
      rollbackTasks(
        queryClient,
        queryKey,
        context,
      );
    },

    onSettled() {
      resetTasksToFirstPage(queryClient, queryKey);
    },
  });
}