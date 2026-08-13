import { useQuery } from "@tanstack/react-query";

import { getRelatedTaskTree } from "../api/tasks";

export function useRelatedTasks(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["tasks", "related", taskId],
    queryFn: () => getRelatedTaskTree(taskId),
    enabled,
  });
}
