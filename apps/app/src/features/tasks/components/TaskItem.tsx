import type { Task } from "../types/task";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { SortableHandle, SortableItem } from "@todo/ui/sortable";
import { TaskRow } from "./TaskRow";

type Props = {
  task: Task;
  draggable?: boolean;
  readOnly?: boolean;
};

export function TaskItem({ task, draggable = false, readOnly = false }: Props) {
  const { mutateAsync: updateTask } = useUpdateTask();

  const { mutateAsync: deleteTask } = useDeleteTask();

  async function toggleCompleted() {
    await updateTask({
      id: task.id,
      updates: {
        completed: !task.completed,
        completed_at: task.completed ? null : new Date().toISOString(),
      },
    });
  }

  async function removeTask() {
    await deleteTask(task.id);
  }

  const row = (
    <TaskRow
      task={task}
      onToggleCompleted={toggleCompleted}
      onDelete={removeTask}
      DragHandle={draggable ? SortableHandle : undefined}
      readOnly={readOnly}
    />
  );

  return draggable ? <SortableItem id={task.id}>{row}</SortableItem> : row;
}
