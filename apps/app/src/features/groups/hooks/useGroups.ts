import { useQuery } from "@tanstack/react-query";

import { getGroups } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";

export function useGroups() {
  return useQuery({
    queryKey: GROUPS_QUERY_KEY,
    queryFn: getGroups,
  });
}
