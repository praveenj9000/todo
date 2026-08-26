import { EmptyState, ErrorState, Loading } from "@todo/design-system";
import { FEATURES } from "@/config/features";
import { AsyncList } from "@todo/ui/list";
import { useListsStore } from "@/features/lists";

import { TaskItem } from "./TaskItem";

import { TASK_SORTS } from "../constants/tasks";
import { useMoveTask } from "../hooks/useMoveTask";
import { useTasks } from "../hooks/useTasks";
import { useTasksPaged } from "../hooks/useTasksPaged";
import { useTasksStore } from "../stores/tasks-ui.store";

import type { Task } from "../types/task";

const PAGINATION_MODE = !FEATURES.pagination.enabled
  ? "none"
  : FEATURES.infiniteScroll.enabled
    ? "infiniteScroll"
    : "paged";

const emptyStateProps = {
  renderLoading: () => <Loading />,
  renderError: (retry: () => void) => <ErrorState onRetry={retry} />,
  renderEmpty: () => (
    <EmptyState title="No tasks yet" description="Create your first task above." />
  ),
};

export function TaskList() {
  const sort = useTasksStore((state) => state.sort);
  const isSortable = FEATURES.dragSort.enabled && sort === TASK_SORTS.MANUAL;
  const selectedListId = useListsStore((state) => state.selectedListId);

  const { mutate: moveTask } = useMoveTask();

  function handleReorder(
    result: { itemId: string; prevId: string | null; nextId: string | null },
    items: Task[],
  ) {
    moveTask({
      taskId: result.itemId,
      prevId: result.prevId,
      nextId: result.nextId,
      items,
    });
  }

  // Guard against fetching with no list filter at all — see the fix
  // note in useTasks/useTasksPaged: without this, an unset
  // selectedListId would otherwise silently return tasks across every
  // list. Checked here rather than assumed, since it's the one state
  // that must never reach the data hooks unfiltered.
  if (!selectedListId) {
    return (
      <EmptyState
        title="No list selected"
        description="Select a list from the sidebar, or create a new one, to get started."
      />
    );
  }

  if (PAGINATION_MODE === "paged") {
    return <PagedTaskList isSortable={isSortable} onReorder={handleReorder} />;
  }

  return (
    <ScrollTaskList
      isSortable={isSortable}
      onReorder={handleReorder}
      infiniteScroll={PAGINATION_MODE === "infiniteScroll"}
    />
  );
}

function ScrollTaskList({
  isSortable,
  onReorder,
  infiniteScroll,
}: {
  isSortable: boolean;
  onReorder: (
    result: { itemId: string; prevId: string | null; nextId: string | null },
    items: Task[],
  ) => void;
  infiniteScroll: boolean;
}) {
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTasks();

  const tasks: Task[] = data?.pages.flatMap((page) => page.tasks) ?? [];

  if (!infiniteScroll) {
    return (
      <AsyncList<Task>
        items={tasks}
        isPending={isPending}
        isError={isError}
        onRetry={() => void refetch()}
        keyExtractor={(task) => task.id}
        renderItem={(task) => <TaskItem key={task.id} task={task} draggable={isSortable} />}
        dragSort={isSortable}
        activationDistance={8}
        onReorder={onReorder}
        pagination="none"
        {...emptyStateProps}
      />
    );
  }

  return (
    <AsyncList<Task>
      items={tasks}
      isPending={isPending}
      isError={isError}
      onRetry={() => void refetch()}
      keyExtractor={(task) => task.id}
      renderItem={(task) => <TaskItem key={task.id} task={task} draggable={isSortable} />}
      dragSort={isSortable}
      activationDistance={8}
      onReorder={onReorder}
      pagination="infiniteScroll"
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      {...emptyStateProps}
    />
  );
}

function PagedTaskList({
  isSortable,
  onReorder,
}: {
  isSortable: boolean;
  onReorder: (
    result: { itemId: string; prevId: string | null; nextId: string | null },
    items: Task[],
  ) => void;
}) {
  const { data, isPending, isError, refetch, isFetching } = useTasksPaged();

  const page = useTasksStore((state) => state.page);
  const pageSize = useTasksStore((state) => state.pageSize);
  const setPage = useTasksStore((state) => state.setPage);
  const setPageSize = useTasksStore((state) => state.setPageSize);

  const tasks: Task[] = data?.tasks ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <AsyncList<Task>
      items={tasks}
      isPending={isPending}
      isError={isError}
      onRetry={() => void refetch()}
      keyExtractor={(task) => task.id}
      renderItem={(task) => <TaskItem key={task.id} task={task} draggable={isSortable} />}
      dragSort={isSortable}
      onReorder={onReorder}
      pagination="paged"
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      isFetching={isFetching}
      {...emptyStateProps}
    />
  );
}
