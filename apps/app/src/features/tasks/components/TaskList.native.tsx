import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Loading } from "@/components/Loading";
import { SortableList } from "@todo/ui/sortable";
import { Spinner } from "tamagui";

import { TaskItem } from "./TaskItem";

import { useMoveTask } from "../hooks/useMoveTask";
import { useTasks } from "../hooks/useTasks";

import type { Task } from "../types/task";

export function TaskList() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasks();

  const {
    mutate: moveTask,
  } = useMoveTask();

  const tasks: Task[] =
    data?.pages.flatMap((page) => page.tasks) ?? [];

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task above."
      />
    );
  }

  return (
    <>
      <SortableList<Task>
        data={tasks}
        keyExtractor={(task) => task.id}
        activationDistance={8}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onReorder={(result, items) => {
          moveTask({
            taskId: result.itemId,
            prevId: result.prevId,
            nextId: result.nextId,
            items,
          });
        }}
        renderItem={(task) => (
          <TaskItem
            key={task.id}
            task={task}
          />
        )}
      />

      {isFetchingNextPage ? <Spinner /> : null}
    </>
  );
}