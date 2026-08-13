import { useQuery } from "@tanstack/react-query";

import { getTaskOrigin } from "../api/tasks";

/**
 * Known N+1 pattern: this fires one query per visible row. Acceptable at
 * this app's current scale (dozens of rows per page); worth batching
 * into a single query per page if list sizes grow significantly.
 */
export function useTaskOrigin(taskId: string) {
  return useQuery({
    queryKey: ["tasks", "origin", taskId],
    queryFn: () => getTaskOrigin(taskId),
    staleTime: 60_000,
  });
}
