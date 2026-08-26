import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelListQuery,
  flattenInfiniteCache,
  getInfiniteCache,
  invalidateList,
  resetInfiniteCacheToFirstPage,
  setInfiniteCacheItems,
  setPagedCacheItems,
} from "@todo/query-toolkit";

import { FEATURES } from "@/config/features";

import { moveTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { TASK_MUTATION_KEYS } from "../constants/mutation-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import { useListsStore } from "@/features/lists/stores/lists-ui.store";
import type { MoveTaskInput, Task, TasksCursor, TasksOffsetPage, TasksPage } from "../types/task";

type MoveTaskVariables = MoveTaskInput & { items: Task[] };

const scrollAccessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

const pagedAccessor = {
  getItems: (page: TasksOffsetPage) => page.tasks,
  withItems: (page: TasksOffsetPage, items: Task[]) => ({ ...page, tasks: items }),
};

const IS_PAGED = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

export function useMoveTask() {
  const queryClient = useQueryClient();
  const { filter, sort, page, pageSize } = useTasksStore();
  const selectedListId = useListsStore((state) => state.selectedListId);

  const scrollQueryKey = [...TASKS_QUERY_KEY, selectedListId, filter, sort];
  const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", selectedListId, filter, sort, page, pageSize];

  return useMutation({
    mutationKey: TASK_MUTATION_KEYS.move,
    mutationFn: ({ taskId, prevId, nextId }: MoveTaskVariables) =>
      moveTask({ taskId, prevId, nextId }),

    async onMutate({ items }) {
      if (IS_PAGED) {
        setPagedCacheItems(queryClient, pagedQueryKey, items, pagedAccessor);
        return undefined;
      }

      await cancelListQuery(queryClient, scrollQueryKey);

      const previousItems = flattenInfiniteCache(
        getInfiniteCache<TasksPage, TasksCursor | null>(queryClient, scrollQueryKey),
        scrollAccessor,
      );

      setInfiniteCacheItems(
        queryClient,
        scrollQueryKey,
        items,
        scrollAccessor,
        { tasks: [], nextCursor: null },
        null,
      );

      return { previousItems };
    },

    onError(_error, _vars, context) {
      if (IS_PAGED || !context) {
        return;
      }

      setInfiniteCacheItems(
        queryClient,
        scrollQueryKey,
        context.previousItems,
        scrollAccessor,
        { tasks: [], nextCursor: null },
        null,
      );
    },

    onSettled() {
      resetInfiniteCacheToFirstPage(queryClient, scrollQueryKey);
      invalidateList(queryClient, TASKS_QUERY_KEY);
    },
  });
}
