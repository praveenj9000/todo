import { supabase } from "@/lib/supabase";
import type { Group, GroupMember, GroupWithMemberCount, UpdateGroup } from "../types/group";

export async function getGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createGroup(name: string): Promise<Group> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("groups")
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGroup(id: string, updates: UpdateGroup): Promise<Group> {
  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) throw error;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase.rpc("get_group_members_with_email", {
    p_group_id: groupId,
  });

  if (error) throw error;
  return data ?? [];
}

export async function addGroupMember(groupId: string, email: string): Promise<GroupMember> {
  const { data, error } = await supabase.rpc("add_group_member_by_email", {
    p_group_id: groupId,
    p_email: email.trim(),
  });

  if (error) throw error;
  return data as unknown as GroupMember;
}

export async function removeGroupMember(memberId: string): Promise<void> {
  const { error } = await supabase.from("group_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function getGroupsWithMemberCounts(): Promise<GroupWithMemberCount[]> {
  const { data, error } = await supabase
    .from("groups_with_member_count")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
