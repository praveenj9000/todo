import {
  Button,
  Text,
  XStack,
} from "tamagui";

import type { Task } from "../types/task";

import { useDeleteTask } from "../hooks/useDeleteTask";
import { useUpdateTask } from "../hooks/useUpdateTask";

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
    <XStack
      padding="$4"
      gap="$2"
      alignItems="center"
    >
      <Button
        size="$3"
        onPress={toggleCompleted}
      >
        {task.completed ? "✓" : "○"}
      </Button>

      <Text flex={1}>
        {task.title}
      </Text>

      <Button
        size="$3"
        theme="red"
        onPress={removeTask}
      >
        Delete
      </Button>
    </XStack>
  );
}