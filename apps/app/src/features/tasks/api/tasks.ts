import { supabase } from "@/lib/supabase";

import type {
  GetTasksInput,
  NewTask,
  Task,
  UpdateTask,
} from "../types/task";

export async function getTasks({
  filter,
  sort,
}: GetTasksInput): Promise<Task[]> {
  let query = supabase
    .from("tasks")
    .select("*");

  switch (filter) {
    case "active":
      query = query.eq("completed", false);
      break;

    case "completed":
      query = query.eq("completed", true);
      break;
  }

  switch (sort) {
    case "manual":
      query = query
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });
      break;

    case "created":
      query = query.order("created_at", {
        ascending: false,
      });
      break;

    case "updated":
      query = query.order("updated_at", {
        ascending: false,
      });
      break;
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function createTask(
  input: Pick<NewTask, "title">,
): Promise<Task> {
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
  updates: UpdateTask,
): Promise<Task> {
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
  id: string,
): Promise<void> {
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

export async function reorderTasks(
  taskIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc(
    "reorder_tasks",
    {
      task_ids: taskIds,
    },
  );

  if (error) {
    throw error;
  }
}