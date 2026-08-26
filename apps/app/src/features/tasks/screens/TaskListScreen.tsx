import { useEffect } from "react";

import { XStack, YStack } from "tamagui";

import { ListSidebar, useLists, useListsRealtime, useListsStore } from "@/features/lists";

import { AddTaskForm } from "../components/AddTaskForm";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";
import { TaskScrollProvider } from "../context/TaskScrollContext";
import { useTasksRealtime } from "../hooks/useTasksRealtime";

export function TaskListScreen() {
  useTasksRealtime();
  useListsRealtime();

  const { data: lists = [] } = useLists();
  const selectedListId = useListsStore((state) => state.selectedListId);
  const setSelectedListId = useListsStore((state) => state.setSelectedListId);

  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id);
    }
  }, [selectedListId, lists, setSelectedListId]);

  return (
    <TaskScrollProvider>
      <XStack flex={1} role="main">
        <ListSidebar />

        <YStack flex={1} minWidth={0}>
          <AddTaskForm />
          <TaskFilters />

          <YStack flex={1} minHeight={0}>
            <TaskList />
          </YStack>
        </YStack>
      </XStack>
    </TaskScrollProvider>
  );
}
