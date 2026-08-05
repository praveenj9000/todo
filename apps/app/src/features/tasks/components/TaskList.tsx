import DraggableFlatList, {
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Loading } from "@/components/Loading";

import { useReorderTasks } from "../hooks/useReorderTasks";
import { useTasks } from "../hooks/useTasks";

import type { Task } from "../types/task";

import { TaskItem } from "./TaskItem";

export function TaskList() {
  const {
    data,
    isPending,
    isError,
    refetch,
  } = useTasks();

  const {
    mutate: reorderTasks,
  } = useReorderTasks();

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

  if (!data?.length) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task above."
      />
    );
  }

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({
        item,
        drag,
      }: RenderItemParams<Task>) => (
        <TaskItem
          task={item}
          drag={drag}
        />
      )}
      onDragEnd={({ data }) => {
        reorderTasks(
          data.map(
            (task) => task.id,
          ),
        );
      }}
    />
  );
}