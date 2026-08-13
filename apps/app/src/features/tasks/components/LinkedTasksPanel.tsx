import { useRef, useState } from "react";
import { Button, Input, Spinner, Text, XStack, YStack } from "tamagui";

import { useRelatedTasks } from "../hooks/useRelatedTasks";
import { useCreateLinkedTask } from "../hooks/useCreateLinkedTask";
import { useJumpToTask } from "../hooks/useJumpToTask";
import { isWeb } from "../utils/platform";

type Props = {
  taskId: string;
};

export function LinkedTasksPanel({ taskId }: Props) {
  const [title, setTitle] = useState("");
  const { data, isPending } = useRelatedTasks(taskId, true);
  const { mutate: createLinkedTask, isPending: isCreating } = useCreateLinkedTask();
  const { jumpToTask, status } = useJumpToTask();

  const items = data?.items ?? [];
  const root0TaskId = data?.root0TaskId ?? null;

  const rowRefs = useRef(new Map<string, HTMLElement>());

  function registerRow(id: string, node: HTMLElement | null) {
    if (!isWeb) {
      return;
    }

    if (node) {
      rowRefs.current.set(id, node);
    } else {
      rowRefs.current.delete(id);
    }
  }

  function scrollPanelToRoot0() {
    if (!isWeb || !root0TaskId) {
      return;
    }

    rowRefs.current.get(root0TaskId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleAdd() {
    const value = title.trim();

    if (!value) {
      return;
    }

    setTitle("");
    createLinkedTask({ sourceTaskId: taskId, title: value });
  }

  return (
    <YStack paddingLeft="$6" paddingRight="$4" paddingVertical="$2" gap="$2">
      {isPending ? (
        <Spinner size="small" />
      ) : (
        <YStack {...(isWeb ? { style: { maxHeight: 240, overflowY: "auto" } } : {})}>
          {items.map(({ task, depth, isAncestor }) => (
            <YStack
              key={task.id}
              ref={(node) => registerRow(task.id, node as unknown as HTMLElement | null)}
            >
              <XStack alignItems="center" gap="$2" padding="$2">
                {root0TaskId ? (
                  <Button
                    chromeless
                    size="$2"
                    onPress={scrollPanelToRoot0}
                    aria-label="Scroll list to root 0"
                  >
                    ⤒
                  </Button>
                ) : null}

                <Button
                  chromeless
                  size="$2"
                  onPress={() => jumpToTask(task.id)}
                  disabled={status === "jumping"}
                  aria-label={`Jump to ${task.title}`}
                >
                  →
                </Button>

                <Text fontSize="$3" flex={1} fontWeight={isAncestor ? "700" : "400"}>
                  {task.completed ? "✓" : "○"} {task.title}
                </Text>

                <Text fontSize="$1" color="$gray10">
                  root {depth}
                </Text>
              </XStack>
            </YStack>
          ))}
        </YStack>
      )}

      {status === "not-found" ? (
        <Text fontSize="$1" color="$gray10">
          Couldn't locate that task
        </Text>
      ) : null}

      <XStack gap="$2">
        <Input
          flex={1}
          size="$3"
          placeholder="Add a linked task..."
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleAdd}
        />

        <Button size="$3" onPress={handleAdd} disabled={isCreating}>
          Link
        </Button>
      </XStack>
    </YStack>
  );
}
