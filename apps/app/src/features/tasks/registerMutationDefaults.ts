import type { QueryClient } from "@tanstack/react-query";

import { registerListMutationDefaults } from "@todo/query-toolkit";

import { createTask, deleteTask, moveTask, updateTask } from "./api/tasks";

import { TASKS_QUERY_KEY } from "./constants/query-keys";
import { TASK_MUTATION_KEYS } from "./constants/mutation-keys";

import type { MoveTaskInput, UpdateTask } from "./types/task";

export function registerTaskMutationDefaults(queryClient: QueryClient) {
  registerListMutationDefaults(queryClient, {
    mutationKey: TASK_MUTATION_KEYS.create,
    mutationFn: createTask,
    invalidateKey: TASKS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: TASK_MUTATION_KEYS.update,
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTask }) => updateTask(id, updates),
    invalidateKey: TASKS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: TASK_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteTask(id),
    invalidateKey: TASKS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: TASK_MUTATION_KEYS.move,
    mutationFn: (input: MoveTaskInput) => moveTask(input),
    invalidateKey: TASKS_QUERY_KEY,
  });
}
