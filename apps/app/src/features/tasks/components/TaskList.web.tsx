import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Loading } from "@/components/Loading";

import { useTasks } from "../hooks/useTasks";
import { useReorderTasks } from "../hooks/useReorderTasks";

import { TaskItem } from "./TaskItem.web";

export function TaskList() {
  const {
    data = [],
    isPending,
    isError,
    refetch,
  } = useTasks();

  const {
    mutate: reorderTasks,
  } = useReorderTasks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    }),
  );

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

  if (!data.length) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task above."
      />
    );
  }

  function handleDragEnd({
    active,
    over,
  }: DragEndEvent) {
    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    const oldIndex = data.findIndex(
      (task) => task.id === active.id,
    );

    const newIndex = data.findIndex(
      (task) => task.id === over.id,
    );

    const reordered = arrayMove(
      data,
      oldIndex,
      newIndex,
    );

    reorderTasks(
      reordered.map((task) => task.id),
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data.map((task) => task.id)}
        strategy={
          verticalListSortingStrategy
        }
      >
        {data.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}