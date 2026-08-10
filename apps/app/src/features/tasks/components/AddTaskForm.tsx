import { useState } from "react";

import { Button, Input, XStack } from "tamagui";

import { useCreateTask } from "../hooks/useCreateTask";

export function AddTaskForm() {
  const [title, setTitle] = useState("");

  const { mutate: createTask } = useCreateTask();

  function handleSubmit() {
    const value = title.trim();

    if (!value) {
      return;
    }

    setTitle("");

    createTask({
      title: value,
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
