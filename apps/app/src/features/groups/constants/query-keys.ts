export const GROUPS_QUERY_KEY = ["groups"] as const;
export const groupMembersQueryKey = (groupId: string) => ["groups", "members", groupId] as const;
