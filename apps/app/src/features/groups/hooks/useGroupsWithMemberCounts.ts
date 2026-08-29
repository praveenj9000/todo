import { useQuery } from "@tanstack/react-query";
import { getGroupsWithMemberCounts } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";

/**
 * Separate from useGroups() (plain Group[], used by GroupsTab and its
 * optimistic mutations) because this hits a different query — a DB view
 * that includes a per-group member count. Only ShareSettings needs the
 * count, so it isn't worth carrying on every group everywhere.
 */
export function useGroupsWithMemberCounts() {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, "with-member-count"],
    queryFn: getGroupsWithMemberCounts,
  });
}
