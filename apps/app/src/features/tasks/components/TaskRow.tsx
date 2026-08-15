import { useState } from "react";
import type { ComponentType, PropsWithChildren } from "react";

import { Button, Text, XStack, YStack } from "tamagui";

import type { Task } from "../types/task";
import { LinkedTasksPanel } from "./LinkedTasksPanel";
import { useTaskOrigin } from "../hooks/useTaskOrigin";
import { useJumpToTask } from "../hooks/useJumpToTask";
import { useTaskScroll } from "../context/TaskScrollContext";

type DragHandleComponent = ComponentType<PropsWithChildren>;

type Props = {
  task: Task;
  onToggleCompleted: () => void;
  onDelete: () => void;
  DragHandle?: DragHandleComponent;
};

export function TaskRow({ task, onToggleCompleted, onDelete, DragHandle }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { data: origin } = useTaskOrigin(task.id);
  const { registerRow } = useTaskScroll();

  return (
    <YStack
      ref={(node) => registerRow(task.id, node as unknown as HTMLElement | null)}
      testID={`task-row-${task.id}`}
    >
      <XStack padding="$4" gap="$3" alignItems="center">
        {origin ? <JumpToOriginButton originId={origin.id} /> : null}

        {DragHandle ? (
          <DragHandle>
            <Button chromeless size="$3">
              ☰
            </Button>
          </DragHandle>
        ) : null}

        <Button size="$3" onPress={onToggleCompleted}>
          {task.completed ? "✓" : "○"}
        </Button>

        <Text flex={1}>{task.title}</Text>

        <Button chromeless size="$3" onPress={() => setExpanded((prev) => !prev)}>
          {expanded ? "▾" : "▸"}
        </Button>

        <Button size="$3" theme="red" onPress={onDelete}>
          Delete
        </Button>
      </XStack>

      {expanded ? <LinkedTasksPanel taskId={task.id} /> : null}
    </YStack>
  );
}

function JumpToOriginButton({ originId }: { originId: string }) {
  const { jumpToTask, status } = useJumpToTask();

  return (
    <Button
      chromeless
      size="$2"
      onPress={() => jumpToTask(originId)}
      disabled={status === "jumping"}
      aria-label="Jump to origin task"
    >
      ↩
    </Button>
  );
}
