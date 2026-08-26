import type { Database } from "@todo/types";

export type ListShare = Database["public"]["Tables"]["list_shares"]["Row"];

export type NewListShare = Database["public"]["Tables"]["list_shares"]["Insert"];

export type SharePermission = "read" | "edit";

export type ShareSubjectType = "user" | "group";

export type ShareSettings = {
  publicRead: boolean;
  publicEdit: boolean;
  shareToken: string;
  shares: ListShare[];
};
