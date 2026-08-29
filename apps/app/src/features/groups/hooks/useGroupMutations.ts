import { useOptimisticFlatListMutation } from "@todo/query-toolkit";

import { createGroup, deleteGroup, updateGroup } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";
import { GROUP_MUTATION_KEYS } from "../constants/mutation-keys";
import type { Group, UpdateGroup } from "../types/group";

/**
 * A group row that only exists locally, not yet confirmed by the server —
 * e.g. still queued while offline. `id` is a placeholder, not a real
 * group id, so anything that needs a real id (managing members, renaming,
 * deleting) must stay disabled until this clears.
 */
export type OptimisticGroup = Group & { _pending?: boolean };

function buildOptimisticGroup(name: string): OptimisticGroup {
  const now = new Date().toISOString();

  return {
    id: `pending:${crypto.randomUUID()}`,
    owner_id: "",
    name,
    created_at: now,
    updated_at: now,
    _pending: true,
  };
}

export function useCreateGroup() {
  return useOptimisticFlatListMutation<Group, string>({
    mutationKey: GROUP_MUTATION_KEYS.create,
    queryKey: GROUPS_QUERY_KEY,
    mutationFn: (name) => createGroup(name),
    updateItems: (items, name) => [...items, buildOptimisticGroup(name)],
  });
}

export function useUpdateGroup() {
  return useOptimisticFlatListMutation<Group, { id: string; updates: UpdateGroup }>({
    mutationKey: GROUP_MUTATION_KEYS.update,
    queryKey: GROUPS_QUERY_KEY,
    mutationFn: ({ id, updates }) => updateGroup(id, updates),
    updateItems: (items, { id, updates }) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  });
}

export function useDeleteGroup() {
  return useOptimisticFlatListMutation<Group, string>({
    mutationKey: GROUP_MUTATION_KEYS.delete,
    queryKey: GROUPS_QUERY_KEY,
    mutationFn: (id) => deleteGroup(id),
    updateItems: (items, id) => items.filter((item) => item.id !== id),
  });
}

/** Aggregate wrapper — matches the shape GroupsTab already consumes. */
export function useGroupMutations() {
  return {
    createGroupMutation: useCreateGroup(),
    updateGroupMutation: useUpdateGroup(),
    deleteGroupMutation: useDeleteGroup(),
  };
}
