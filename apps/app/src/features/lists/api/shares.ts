import { supabase } from "@/lib/supabase";

import type { ListShare, SharePermission, ShareSubjectType } from "../types/share";

export async function getListShares(listId: string): Promise<ListShare[]> {
  const { data, error } = await supabase
    .from("list_shares")
    .select("*")
    .eq("list_id", listId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function addListShare(input: {
  listId: string;
  subjectType: ShareSubjectType;
  subjectId: string;
  permission: SharePermission;
}): Promise<ListShare> {
  const { data, error } = await supabase
    .from("list_shares")
    .insert({
      list_id: input.listId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      permission: input.permission,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateListShare(id: string, permission: SharePermission): Promise<ListShare> {
  const { data, error } = await supabase
    .from("list_shares")
    .update({ permission })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeListShare(id: string): Promise<void> {
  const { error } = await supabase.from("list_shares").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateListPublicAccess(input: {
  listId: string;
  publicRead: boolean;
  publicEdit: boolean;
}): Promise<void> {
  const { error } = await supabase
    .from("lists")
    .update({
      public_read: input.publicRead,
      public_edit: input.publicEdit,
    })
    .eq("id", input.listId);

  if (error) {
    throw error;
  }
}

export async function getListByShareToken(shareToken: string) {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
