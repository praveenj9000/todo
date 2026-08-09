import { YStack } from "tamagui";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";

export function TaskListScreen() {
  return (
    <YStack flex={1}>
      <AddTaskForm />
      <TaskFilters />

      <YStack flex={1} minHeight={0}>
        <TaskList />
      </YStack>
    </YStack>
  );
}
