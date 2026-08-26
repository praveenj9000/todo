import type { Database } from "@todo/types";

export type List = Database["public"]["Tables"]["lists"]["Row"];

export type NewList = Database["public"]["Tables"]["lists"]["Insert"];

export type UpdateList = Database["public"]["Tables"]["lists"]["Update"];

export type ListType = "todo" | "checklist";
