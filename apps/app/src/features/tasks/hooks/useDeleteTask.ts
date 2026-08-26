import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelListQuery,
  flattenInfiniteCache,
  getInfiniteCache,
  invalidateList,
  setInfiniteCacheItems,
  setPagedCacheItems,
} from "@todo/query-toolkit";

import { FEATURES } from "@/config/features";

import { deleteTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { TASK_MUTATION_KEYS } from "../constants/mutation-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import { useListsStore } from "@/features/lists/stores/lists-ui.store";
import type { Task, TasksCursor, TasksOffsetPage, TasksPage } from "../types/task";

const scrollAccessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

const pagedAccessor = {
  getItems: (page: TasksOffsetPage) => page.tasks,
  withItems: (page: TasksOffsetPage, items: Task[]) => ({ ...page, tasks: items }),
};

const IS_PAGED = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { filter, sort, page, pageSize } = useTasksStore();
  const selectedListId = useListsStore((state) => state.selectedListId);

  const scrollQueryKey = [...TASKS_QUERY_KEY, selectedListId, filter, sort];
  const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", selectedListId, filter, sort, page, pageSize];

  return useMutation({
    mutationKey: TASK_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteTask(id),

    async onMutate(id: string) {
      if (IS_PAGED) {
        const currentPage = queryClient.getQueryData<TasksOffsetPage>(pagedQueryKey);
        const items = (currentPage?.tasks ?? []).filter((task) => task.id !== id);

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
        previousItems.filter((task) => task.id !== id),
        scrollAccessor,
        { tasks: [], nextCursor: null },
        null,
      );

      return { previousItems };
    },

    onError(_error, _id, context) {
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
      invalidateList(queryClient, TASKS_QUERY_KEY);
    },
  });
}
