import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLinkedTask } from "../api/tasks";
import { TASKS_QUERY_KEY } from "../constants/query-keys";

export function useCreateLinkedTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLinkedTask,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["tasks", "related", variables.sourceTaskId],
      });
    },
  });
}
