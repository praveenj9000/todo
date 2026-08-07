import type { Task } from "../types/task";
import { useDeleteTask } from "../hooks/useDeleteTask";
import { useUpdateTask } from "../hooks/useUpdateTask";
import { SortableHandle, SortableItem } from "@todo/ui/sortable";
import { TaskRow } from "./TaskRow";

type Props = {
  task: Task;
};

export function TaskItem({
  task,
}: Props) {
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
    <SortableItem id={task.id}>
      <TaskRow
        task={task}
        onToggleCompleted={toggleCompleted}
        onDelete={removeTask}
        DragHandle={SortableHandle}
      />
    </SortableItem>
  );
}