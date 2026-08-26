import type { Database } from "@todo/types";

export type Group = Database["public"]["Tables"]["groups"]["Row"];

export type NewGroup = Database["public"]["Tables"]["groups"]["Insert"];

export type UpdateGroup = Database["public"]["Tables"]["groups"]["Update"];

export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];

export type GroupWithMembers = Group & {
  group_members: GroupMember[];
};

export type GroupInput = {
  name: string;
  memberEmails: string[];
};
