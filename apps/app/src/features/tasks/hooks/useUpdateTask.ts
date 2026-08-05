import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";
import type { UpdateTask } from "../types/task";

type UpdateTaskInput = {
  id: string;
  updates: UpdateTask;
};

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: UpdateTaskInput) =>
      updateTask(id, updates),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}