import { useQuery } from "@tanstack/react-query";

import { getListShares } from "../api/shares";

export function useListShares(listId: string) {
  return useQuery({
    queryKey: ["lists", "shares", listId],
    queryFn: () => getListShares(listId),
    enabled: Boolean(listId),
  });
}
