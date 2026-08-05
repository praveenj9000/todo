import { useState } from "react";

import {
    Button,
    Input,
    XStack,
} from "tamagui";

import { useCreateTask } from "../hooks/useCreateTask";

export function AddTaskForm() {
    const [title, setTitle] = useState("");

    const {
        mutateAsync: createTask,
        isPending,
    } = useCreateTask();

    async function handleSubmit() {
        if (isPending) {
            return;
        }

        const value = title.trim();

        if (!value) {
            return;
        }

        await createTask({
            title: value,
        });

        setTitle("");
    }
    
    return (
        <XStack
            gap="$2"
            padding="$4"
        >
            <Input
                flex={1}
                placeholder="Add a task..."
                value={title}
                onChangeText={setTitle}
                onSubmitEditing={handleSubmit}
                disabled={isPending}
                returnKeyType="done"
            />

            <Button
                onPress={handleSubmit}
                disabled={isPending}
            >
                Add
            </Button>
        </XStack>
    );
}