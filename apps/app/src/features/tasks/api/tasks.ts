import { supabase } from "@/lib/supabase";

import { TASKS_PAGE_SIZE } from "../constants/tasks";

import type {
  GetTasksPageInput,
  GetTasksPageOffsetInput,
  RelatedTask,
  MoveTaskInput,
  NewTask,
  RelatedTaskTree,
  Task,
  TasksOffsetPage,
  TasksPage,
  UpdateTask,
} from "../types/task";

import type { TaskSort } from "../constants/tasks";

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
  listId,
}: GetTasksPageInput): Promise<TasksPage> {
  const column = SORT_COLUMN[sort];
  const ascending = SORT_ASCENDING[sort];

  let query = supabase.from("tasks").select("*");

  if (listId) {
    query = query.eq("list_id", listId);
  }

  switch (filter) {
    case "active":
      query = query.eq("completed", false);
      break;

    case "completed":
      query = query.eq("completed", true);
      break;
  }

  query = query.order(column, { ascending }).order("id", { ascending: true }).limit(limit);

  if (cursor) {
    const op = ascending ? "lt" : "gt";

    query = query.or(
      `${column}.${op}.${cursor.primary},and(${column}.eq.${cursor.primary},id.gt.${cursor.id})`,
    );
  }

  const { data, error } = await query;

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
  listId,
}: GetTasksPageOffsetInput): Promise<TasksOffsetPage> {
  const column = SORT_COLUMN[sort];
  const ascending = SORT_ASCENDING[sort];

  let query = supabase.from("tasks").select("*", { count: "exact" });

  if (listId) {
    query = query.eq("list_id", listId);
  }

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

  query = query.order(column, { ascending }).order("id", { ascending: true }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    tasks: data ?? [],
    totalCount: count ?? 0,
  };
}

export async function createTask(input: Pick<NewTask, "title" | "list_id">): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      list_id: input.list_id,
      user_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTask(id: string, updates: UpdateTask): Promise<Task> {
  const { data, error } = await supabase
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

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function moveTask({ taskId, prevId, nextId }: MoveTaskInput): Promise<Task> {
  const { data, error } = await supabase.rpc("move_task", {
    p_task_id: taskId,
    p_prev_id: prevId ?? undefined,
    p_next_id: nextId ?? undefined,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function createLinkedTask(input: {
  sourceTaskId: string;
  title: string;
}): Promise<Task> {
  const { data, error } = await supabase.rpc("create_linked_task", {
    p_source_task_id: input.sourceTaskId,
    p_title: input.title,
  });

  if (error) {
    throw error;
  }

  return data;
}

type TaskLinkRow = {
  task_id_a: string;
  task_id_b: string;
  created_from_task_id: string | null;
  tasks_a: Task | null;
  tasks_b: Task | null;
};

function byCreatedAt(a: Task, b: Task) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

/**
 * Returns every task directly or indirectly linked to taskId — the
 * entire connected tree, not just direct relations. Flattened into a
 * tree-ordered list (parent before its children, siblings sorted by
 * created_at) via one recursive RPC call plus one batched fetch for the
 * tasks/links themselves, then the tree is built and traversed
 * client-side (cheap — this data set is small even for a deep tree).
 */
export async function getRelatedTaskTree(taskId: string): Promise<RelatedTaskTree> {
  const { data: connectedIds, error: rpcError } = await supabase.rpc("get_connected_task_ids", {
    p_task_id: taskId,
  });

  if (rpcError) {
    throw rpcError;
  }

  const ids: string[] = connectedIds ?? [];

  if (ids.length <= 1) {
    return { items: [], root0TaskId: null };
  }

  const [{ data: tasksData, error: tasksError }, { data: linksData, error: linksError }] =
    await Promise.all([
      supabase.from("tasks").select("*").in("id", ids),
      supabase
        .from("task_links")
        .select("task_id_a, task_id_b, created_from_task_id")
        .in("task_id_a", ids)
        .in("task_id_b", ids),
    ]);

  if (tasksError) {
    throw tasksError;
  }

  if (linksError) {
    throw linksError;
  }

  const tasksById = new Map<string, Task>();
  (tasksData ?? []).forEach((task) => tasksById.set(task.id, task));

  // parentOf: childId -> parentId. Each task has at most one parent
  // (created_from_task_id is set once, at creation time), so this
  // connected component is guaranteed to be a proper tree.
  const parentOf = new Map<string, string>();
  const childrenOf = new Map<string, string[]>();

  for (const row of linksData ?? []) {
    if (!row.created_from_task_id) {
      continue;
    }

    const child = row.created_from_task_id === row.task_id_a ? row.task_id_b : row.task_id_a;

    parentOf.set(child, row.created_from_task_id);
    childrenOf.set(row.created_from_task_id, [
      ...(childrenOf.get(row.created_from_task_id) ?? []),
      child,
    ]);
  }

  // Walk up from taskId to find the true root of the tree.
  let rootId = taskId;
  const visitedUp = new Set<string>();

  while (parentOf.has(rootId) && !visitedUp.has(rootId)) {
    visitedUp.add(rootId);
    rootId = parentOf.get(rootId)!;
  }

  // The direct ancestor chain of the viewed task (for bolding) —
  // separate from depth, which every task at that level shares.
  const ancestorIds = new Set<string>();
  let current = parentOf.get(taskId);

  while (current && !ancestorIds.has(current)) {
    ancestorIds.add(current);
    current = parentOf.get(current);
  }

  // Preorder traversal from the true root, tracking depth (root = 0,
  // its children = 1, etc.) — every task at the same level gets the
  // same depth, independent of whether it's an ancestor of taskId.
  const items: RelatedTask[] = [];
  const visitedDown = new Set<string>();

  function visit(id: string, depth: number) {
    if (visitedDown.has(id)) {
      return;
    }

    visitedDown.add(id);

    if (id !== taskId) {
      const task = tasksById.get(id);

      if (task) {
        items.push({ task, depth, isAncestor: ancestorIds.has(id) });
      }
    }

    const children = (childrenOf.get(id) ?? [])
      .map((childId) => tasksById.get(childId))
      .filter((t): t is Task => Boolean(t))
      .sort(byCreatedAt);

    children.forEach((child) => visit(child.id, depth + 1));
  }

  visit(rootId, 0);

  return { items, root0TaskId: rootId !== taskId ? rootId : null };
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Determines which offset-paginated page a task falls on, under the
 * given sort, treating filter as "all" (jumping to a linked task should
 * work regardless of the active/completed filter the viewer started
 * from — the caller switches filter to "all" before using this).
 *
 * Only meaningful in paged (offset) mode — there is no fixed "page
 * number" concept in infinite-scroll/keyset pagination.
 */
export async function getTaskPageNumber(
  taskId: string,
  sort: TaskSort,
  pageSize: number,
): Promise<number | null> {
  const target = await getTaskById(taskId);

  if (!target) {
    return null;
  }

  const column = SORT_COLUMN[sort];
  const ascending = SORT_ASCENDING[sort];
  const op = ascending ? "lt" : "gt";

  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .or(`${column}.${op}.${target[column]},and(${column}.eq.${target[column]},id.lt.${target.id})`);

  if (error) {
    throw error;
  }

  const rank = count ?? 0;

  return Math.floor(rank / pageSize) + 1;
}

/**
 * Returns the single task this task was created from, if any. A task can
 * only ever have one origin — it's set once, at creation time, via
 * create_linked_task. Used by TaskRow to decide whether to show the
 * "scroll to origin" button, independent of whether the linked-tasks
 * panel is expanded.
 */
export async function getTaskOrigin(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("task_links")
    .select(
      "created_from_task_id, task_id_a, task_id_b, tasks_a:task_id_a(*), tasks_b:task_id_b(*)",
    )
    .or(`task_id_a.eq.${taskId},task_id_b.eq.${taskId}`)
    .not("created_from_task_id", "is", null)
    .returns<TaskLinkRow[]>();

  if (error) {
    throw error;
  }

  const originLink = (data ?? []).find(
    (row) => row.created_from_task_id && row.created_from_task_id !== taskId,
  );

  if (!originLink) {
    return null;
  }

  const origin =
    originLink.task_id_a === originLink.created_from_task_id
      ? originLink.tasks_a
      : originLink.tasks_b;

  return origin ?? null;
}
