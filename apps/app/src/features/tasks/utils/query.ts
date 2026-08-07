import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import type { Task, TasksCursor, TasksPage } from "../types/task";

type TasksCache = InfiniteData<TasksPage, TasksCursor | null>;

export async function cancelTasksQuery(
  queryClient: QueryClient,
) {
  await queryClient.cancelQueries({
    queryKey: TASKS_QUERY_KEY,
  });
}

export function getTasksCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  return queryClient.getQueryData<TasksCache>(queryKey);
}

export function flattenTasksCache(
  data?: TasksCache,
): Task[] {
  const tasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  const seen = new Set<string>();
  const deduped: Task[] = [];

  for (const task of tasks) {
    if (seen.has(task.id)) {
      continue;
    }

    seen.add(task.id);
    deduped.push(task);
  }

  return deduped;
}

export function setTasksCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
  tasks: Task[],
) {
  queryClient.setQueryData<TasksCache>(
    queryKey,
    (previous) => {
      if (!previous) {
        return {
          pages: [
            {
              tasks,
              nextCursor: null,
            },
          ],
          pageParams: [null],
        };
      }

      const pageSizes = previous.pages.map(
        (page) => page.tasks.length,
      );

      const pages: TasksPage[] = [];
      let offset = 0;

      pageSizes.forEach((size, index) => {
        const isLast = index === pageSizes.length - 1;

        const slice = isLast
          ? tasks.slice(offset)
          : tasks.slice(offset, offset + size);

        offset += size;

        pages.push({
          tasks: slice,
          nextCursor: previous.pages[index].nextCursor,
        });
      });

      return {
        ...previous,
        pages,
      };
    },
  );
}

export function invalidateTasks(
  queryClient: QueryClient,
) {
  queryClient.invalidateQueries({
    queryKey: TASKS_QUERY_KEY,
  });
}

export function resetTasksToFirstPage(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  queryClient.setQueryData<TasksCache>(
    queryKey,
    (previous) => {
      if (!previous || previous.pages.length === 0) {
        return previous;
      }

      return {
        pages: [previous.pages[0]],
        pageParams: [previous.pageParams[0]],
      };
    },
  );

  queryClient.invalidateQueries({
    queryKey,
    refetchType: "active",
  });
}

export function setPagedTasksCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
  tasks: Task[],
) {
  queryClient.setQueryData<{ tasks: Task[]; totalCount: number }>(
    queryKey,
    (previous) =>
      previous
        ? { ...previous, tasks }
        : { tasks, totalCount: tasks.length },
  );

  return undefined;
}