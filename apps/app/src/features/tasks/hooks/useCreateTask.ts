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

import { createTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { TASK_MUTATION_KEYS } from "../constants/mutation-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { NewTask, Task, TasksCursor, TasksOffsetPage, TasksPage } from "../types/task";

const scrollAccessor = {
  getItems: (page: TasksPage) => page.tasks,
  withItems: (page: TasksPage, items: Task[]) => ({ ...page, tasks: items }),
};

const pagedAccessor = {
  getItems: (page: TasksOffsetPage) => page.tasks,
  withItems: (page: TasksOffsetPage, items: Task[]) => ({ ...page, tasks: items }),
};

const IS_PAGED = FEATURES.pagination.enabled && !FEATURES.infiniteScroll.enabled;

function buildOptimisticTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    user_id: "",
    title,
    completed: false,
    completed_at: null,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { filter, sort, page, pageSize } = useTasksStore();

  const scrollQueryKey = [...TASKS_QUERY_KEY, filter, sort];
  const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", filter, sort, page, pageSize];

  return useMutation({
    mutationKey: TASK_MUTATION_KEYS.create,
    mutationFn: createTask,

    async onMutate(input: Pick<NewTask, "title">) {
      const optimisticTask = buildOptimisticTask(input.title);

      if (IS_PAGED) {
        const currentPage = queryClient.getQueryData<TasksOffsetPage>(pagedQueryKey);
        const items = [optimisticTask, ...(currentPage?.tasks ?? [])];

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
        [optimisticTask, ...previousItems],
        scrollAccessor,
        { tasks: [], nextCursor: null },
        null,
      );

      return { previousItems };
    },

    onError(_error, _input, context) {
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
