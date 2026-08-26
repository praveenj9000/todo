import { useEffect } from "react";

import { useLocalSearchParams } from "expo-router";

import { Text, YStack } from "tamagui";

import { useQuery } from "@tanstack/react-query";

import { getListByShareToken } from "../api/shares";
import { useListsStore } from "../stores/lists-ui.store";
import { TaskList } from "@/features/tasks/components/TaskList";
import { TaskScrollProvider } from "@/features/tasks/context/TaskScrollContext";

export function ShareViewScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const setSelectedListId = useListsStore((state) => state.setSelectedListId);

  const {
    data: list,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["lists", "share", token],
    queryFn: () => getListByShareToken(token ?? ""),
    enabled: Boolean(token),
  });

  useEffect(() => {
    if (list) {
      setSelectedListId(list.id);
    }
  }, [list, setSelectedListId]);

  if (isPending) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>Loading...</Text>
      </YStack>
    );
  }

  if (isError || !list) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
        <Text>This list is not available or the link is invalid.</Text>
      </YStack>
    );
  }

  return (
    <TaskScrollProvider>
      <YStack flex={1} padding="$4" gap="$3">
        <Text fontWeight="bold" fontSize="$6">
          {list.type === "checklist" ? "☑ " : "☐ "}
          {list.name}
        </Text>
        <YStack flex={1} minHeight={0}>
          <TaskList />
        </YStack>
      </YStack>
    </TaskScrollProvider>
  );
}
