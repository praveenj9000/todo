import { FlatList } from "react-native";
import { Loading } from "@/components/Loading";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { useTasks } from "../hooks/useTasks";
import { TaskItem } from "./TaskItem";

export function TaskList() {
  const {
    data,
    isPending,
    isError,
    refetch,
  } = useTasks();

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task above."
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TaskItem task={item} />
      )}
    />
  );
}