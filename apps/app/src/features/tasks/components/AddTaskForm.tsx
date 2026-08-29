import { useState } from "react";
import { Button, Input, XStack } from "tamagui";
import { useListsStore } from "@/features/lists/stores/lists-ui.store";
import { useCreateTask } from "../hooks/useCreateTask";

export function AddTaskForm({ readOnly = false }: { readOnly?: boolean }) {
  const [title, setTitle] = useState("");
  const selectedListId = useListsStore((state) => state.selectedListId);
  const { mutate: createTask } = useCreateTask();

  if (readOnly) return null;

  function handleSubmit() {
    const value = title.trim();

    if (!value || !selectedListId) {
      return;
    }

    setTitle("");

    createTask({
      title: value,
      list_id: selectedListId,
    });
  }

  return (
    <XStack gap="$2" padding="$4">
      <Input
        flex={1}
        placeholder="Add a task..."
        value={title}
        onChangeText={setTitle}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
      />

      <Button onPress={handleSubmit}>Add</Button>
    </XStack>
  );
}
