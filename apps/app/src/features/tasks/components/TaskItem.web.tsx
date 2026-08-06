import {
  CSS,
} from "@dnd-kit/utilities";

import {
  useSortable,
} from "@dnd-kit/sortable";

import type { Task } from "../types/task";

import { useDeleteTask } from "../hooks/useDeleteTask";
import { useUpdateTask } from "../hooks/useUpdateTask";

import { TaskRow } from "./TaskRow";

type Props = {
  task: Task;
};

export function TaskItem({
  task,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const {
    mutateAsync: updateTask,
  } = useUpdateTask();

  const {
    mutateAsync: deleteTask,
  } = useDeleteTask();

  async function toggleCompleted() {
    await updateTask({
      id: task.id,
      updates: {
        completed: !task.completed,
        completed_at: task.completed
          ? null
          : new Date().toISOString(),
      },
    });
  }

  async function removeTask() {
    await deleteTask(task.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(
          transform,
        ),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskRow
        task={task}
        onToggleCompleted={toggleCompleted}
        onDelete={removeTask}
      />
    </div>
  );
}