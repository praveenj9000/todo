import { YStack } from "tamagui";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";

export function TaskListScreen() {
  return (
    <YStack flex={1}>
      <AddTaskForm />
      <TaskFilters />
      <TaskList />
    </YStack>
  );
}