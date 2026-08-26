import { supabase } from "@/lib/supabase";

import type { List, NewList, UpdateList } from "../types/list";

export async function getLists(): Promise<List[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createList(input: Pick<NewList, "name" | "type">): Promise<List> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("lists")
    .insert({
      name: input.name,
      type: input.type,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateList(id: string, updates: UpdateList): Promise<List> {
  const { data, error } = await supabase
    .from("lists")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from("lists").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
