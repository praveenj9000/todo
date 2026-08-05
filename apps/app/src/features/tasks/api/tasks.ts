import { supabase } from "@/lib/supabase";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../types/task";


export async function getTasks() {
  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
}


export async function createTask(
  input: Pick<CreateTaskInput, "title">
) {
  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("User not authenticated");
  }


  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      user_id: user.id,
    })
    .select()
    .single();


  if (error) {
    throw error;
  }


  return data;
}


export async function updateTask(
  id: string,
  updates: UpdateTaskInput
) {
  const {
    data,
    error,
  } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();


  if (error) {
    throw error;
  }


  return data;
}


export async function deleteTask(
  id: string
) {
  const {
    error,
  } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);


  if (error) {
    throw error;
  }
}