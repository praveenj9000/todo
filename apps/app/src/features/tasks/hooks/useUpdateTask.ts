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

import { updateTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { TASK_MUTATION_KEYS } from "../constants/mutation-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksCursor, TasksOffsetPage, TasksPage, UpdateTask } from "../types/task";

type UpdateTaskInput = { id: string; updates: UpdateTask };

const scrollAccessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

const pagedAccessor = {
  getItems: (page: TasksOffsetPage) => page.tasks,
  withItems: (page: TasksOffsetPage, items: Task[]) => ({ ...page, tasks: items }),
};

const IS_PAGED = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

function applyUpdate(items: Task[], { id, updates }: UpdateTaskInput) {
  return items.map((task) => (task.id === id ? { ...task, ...updates } : task));
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { filter, sort, page, pageSize } = useTasksStore();

  const scrollQueryKey = [...TASKS_QUERY_KEY, filter, sort];
  const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", filter, sort, page, pageSize];

  return useMutation({
    mutationKey: TASK_MUTATION_KEYS.update,
    mutationFn: ({ id, updates }: UpdateTaskInput) => updateTask(id, updates),

    async onMutate(variables: UpdateTaskInput) {
      if (IS_PAGED) {
        const currentPage = queryClient.getQueryData<TasksOffsetPage>(pagedQueryKey);
        const items = applyUpdate(currentPage?.tasks ?? [], variables);

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
        applyUpdate(previousItems, variables),
        scrollAccessor,
        { tasks: [], nextCursor: null },
        null,
      );

      return { previousItems };
    },

    onError(_error, _variables, context) {
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
