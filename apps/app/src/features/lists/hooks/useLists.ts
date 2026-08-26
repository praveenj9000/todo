import { useQuery } from "@tanstack/react-query";

import { getLists } from "../api/lists";
import { LISTS_QUERY_KEY } from "../constants/query-keys";

export function useLists() {
  return useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: getLists,
  });
}
