import { YStack } from "tamagui";
import { AddTaskForm } from "../components/AddTaskForm";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";
import { TaskScrollProvider } from "../context/TaskScrollContext";
import { useTasksRealtime } from "../hooks/useTasksRealtime";

export function TaskListScreen() {
  useTasksRealtime();

  return (
    <TaskScrollProvider>
      <YStack flex={1}>
        <AddTaskForm />
        <TaskFilters />

        <YStack flex={1} minHeight={0}>
          <TaskList />
        </YStack>
      </YStack>
    </TaskScrollProvider>
  );
}
