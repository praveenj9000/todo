import { supabase } from "@/lib/supabase";

import { TASKS_PAGE_SIZE } from "../constants/tasks";

import type {
  GetTasksPageInput,
  GetTasksPageOffsetInput,
  MoveTaskInput,
  NewTask,
  Task,
  TasksOffsetPage,
  TasksPage,
  UpdateTask,
} from "../types/task";

const SORT_COLUMN = {
  manual: "sort_order",
  created: "created_at",
  updated: "updated_at",
} as const;

const SORT_ASCENDING = {
  manual: true,
  created: false,
  updated: false,
} as const;

export async function getTasksPage({
  filter,
  sort,
  cursor,
  limit = TASKS_PAGE_SIZE,
}: GetTasksPageInput): Promise<TasksPage> {
  const column = SORT_COLUMN[sort];
  const ascending = SORT_ASCENDING[sort];

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

  query = query
    .order(column, { ascending })
    .order("id", { ascending: true })
    .limit(limit);

  if (cursor) {
    const op = ascending ? "lt" : "gt";

    query = query.or(
      `${column}.${op}.${cursor.primary},and(${column}.eq.${cursor.primary},id.gt.${cursor.id})`,
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    throw error;
  }

  const tasks = data ?? [];
  const last = tasks[tasks.length - 1];

  const nextCursor =
    tasks.length === limit && last
      ? {
          primary: last[column] as string | number,
          id: last.id,
        }
      : null;

  return {
    tasks,
    nextCursor,
  };
}

export async function getTasksPageOffset({
  filter,
  sort,
  page,
  pageSize,
}: GetTasksPageOffsetInput): Promise<TasksOffsetPage> {
  const column = SORT_COLUMN[sort];
  const ascending = SORT_ASCENDING[sort];

  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" });

  switch (filter) {
    case "active":
      query = query.eq("completed", false);
      break;

    case "completed":
      query = query.eq("completed", true);
      break;
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query
    .order(column, { ascending })
    .order("id", { ascending: true })
    .range(from, to);

  const {
    data,
    error,
    count,
  } = await query;

  if (error) {
    throw error;
  }

  return {
    tasks: data ?? [],
    totalCount: count ?? 0,
  };
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

export async function moveTask({
  taskId,
  prevId,
  nextId,
}: MoveTaskInput): Promise<Task> {
  const {
    data,
    error,
  } = await supabase.rpc("move_task", {
    p_task_id: taskId,
    p_prev_id: prevId ?? undefined,
    p_next_id: nextId ?? undefined,
  });

  if (error) {
    throw error;
  }

  return data;
}