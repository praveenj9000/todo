import {
  Button,
  XStack,
} from "tamagui";

import {
  TASK_FILTERS,
  TaskFilter,
} from "../constants/tasks";

import { useTasksStore } from "../stores/tasks-ui.store";

const FILTERS: {
  label: string;
  value: TaskFilter;
}[] = [
  {
    label: "All",
    value: TASK_FILTERS.ALL,
  },
  {
    label: "Active",
    value: TASK_FILTERS.ACTIVE,
  },
  {
    label: "Completed",
    value: TASK_FILTERS.COMPLETED,
  },
];

export function TaskFilters() {
  const filter = useTasksStore(
    (state) => state.filter
  );

  const setFilter = useTasksStore(
    (state) => state.setFilter
  );

  return (
    <XStack
      gap="$2"
      padding="$4"
    >
      {FILTERS.map((item) => (
        <Button
          key={item.value}
          theme={
            filter === item.value
              ? "active"
              : undefined
          }
          onPress={() =>
            setFilter(item.value)
          }
        >
          {item.label}
        </Button>
      ))}
    </XStack>
  );
}