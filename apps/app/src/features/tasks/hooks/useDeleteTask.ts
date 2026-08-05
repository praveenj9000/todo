import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}