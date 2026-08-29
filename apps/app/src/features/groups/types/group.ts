import type { Database } from "@todo/types";

export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type NewGroup = Database["public"]["Tables"]["groups"]["Insert"];
export type UpdateGroup = Database["public"]["Tables"]["groups"]["Update"];

export type GroupMember = {
  id: string;
  user_id: string;
  email: string;
  added_at: string;
};

export type GroupWithMembers = Group & {
  group_members: GroupMember[];
};

export type GroupWithMemberCount = Group & { member_count: number };
