import { supabase } from "@/lib/supabase";

import type { GroupInput, GroupMember, GroupWithMembers } from "../types/group";

export async function getGroups(): Promise<GroupWithMembers[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("*, group_members(*)")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createGroup(input: GroupInput): Promise<GroupWithMembers> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: input.name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (groupError) {
    throw groupError;
  }

  const members = await insertMembers(group.id, input.memberEmails);

  return { ...group, group_members: members };
}

export async function updateGroup(id: string, input: GroupInput): Promise<GroupWithMembers> {
  const { data: group, error: updateError } = await supabase
    .from("groups")
    .update({ name: input.name })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // The form always submits the full member list, so replace it wholesale.
  const { error: clearError } = await supabase.from("group_members").delete().eq("group_id", id);

  if (clearError) {
    throw clearError;
  }

  const members = await insertMembers(id, input.memberEmails);

  return { ...group, group_members: members };
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

async function insertMembers(groupId: string, emails: string[]): Promise<GroupMember[]> {
  if (emails.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("group_members")
    .insert(emails.map((email) => ({ group_id: groupId, email })))
    .select();

  if (error) {
    throw error;
  }

  return data ?? [];
}
