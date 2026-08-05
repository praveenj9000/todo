import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}