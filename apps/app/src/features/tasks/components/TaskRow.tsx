import type {
  ComponentType,
  PropsWithChildren,
} from "react";

import {
  Button,
  Text,
  XStack,
} from "tamagui";

import type { Task } from "../types/task";

type DragHandleComponent =
  ComponentType<PropsWithChildren>;

type Props = {
  task: Task;
  onToggleCompleted: () => void;
  onDelete: () => void;
  DragHandle: DragHandleComponent;
};

export function TaskRow({
  task,
  onToggleCompleted,
  onDelete,
  DragHandle,
}: Props) {
  return (
    <XStack
      padding="$4"
      gap="$3"
      alignItems="center"
    >
      <DragHandle>
        <Button
          chromeless
          size="$3"
        >
          ☰
        </Button>
      </DragHandle>

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