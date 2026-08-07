// apps/app/src/features/tasks/hooks/useMoveTask.ts
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { FEATURES } from "@/config/features";

import { moveTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { MoveTaskInput, Task } from "../types/task";

import {
  optimisticUpdate,
  rollbackTasks,
} from "../utils/optimistic";

import {
  invalidateTasks,
  resetTasksToFirstPage,
  setPagedTasksCache,
} from "../utils/query";

type MoveTaskVariables = MoveTaskInput & {
  items: Task[];
};

const IS_PAGED = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

export function useMoveTask() {
  const queryClient = useQueryClient();

  const {
    filter,
    sort,
    page,
    pageSize,
  } = useTasksStore();

  const scrollQueryKey = [...TASKS_QUERY_KEY, filter, sort];
  const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", filter, sort, page, pageSize];

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
      if (IS_PAGED) {
        return setPagedTasksCache(queryClient, pagedQueryKey, items);
      }

      return optimisticUpdate(
        queryClient,
        scrollQueryKey,
        () => items,
      );
    },

    onError(_error, _vars, context) {
      if (IS_PAGED) {
        return;
      }

      rollbackTasks(
        queryClient,
        scrollQueryKey,
        context,
      );
    },

    onSettled() {
      resetTasksToFirstPage(queryClient, scrollQueryKey);
      invalidateTasks(queryClient);
    },
  });
}