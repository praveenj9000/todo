import {
  Button,
  Text,
  XStack,
} from "tamagui";

import type { Task } from "../types/task";

type Props = {
  task: Task;
  onToggleCompleted: () => void;
  onDelete: () => void;
  onDragStart?: () => void;
};

export function TaskRow({
  task,
  onToggleCompleted,
  onDelete,
  onDragStart,
}: Props) {
  return (
    <XStack
      padding="$4"
      gap="$3"
      alignItems="center"
    >
      <Button
        chromeless
        size="$3"
        onLongPress={onDragStart}
      >
        ☰
      </Button>

      <Button
        size="$3"
        onPress={onToggleCompleted}
      >
        {task.completed ? "✓" : "○"}
      </Button>

      <Text flex={1}>
        {task.title}
      </Text>

      <Button
        size="$3"
        theme="red"
        onPress={onDelete}
      >
        Delete
      </Button>
    </XStack>
  );
}