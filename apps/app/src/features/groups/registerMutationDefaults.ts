import type { QueryClient } from "@tanstack/react-query";

import { registerListMutationDefaults } from "@todo/query-toolkit";

import {
  addGroupMember,
  createGroup,
  deleteGroup,
  removeGroupMember,
  updateGroup,
} from "./api/groups";

import { GROUPS_QUERY_KEY } from "./constants/query-keys";
import { GROUP_MUTATION_KEYS } from "./constants/mutation-keys";

import type { UpdateGroup } from "./types/group";

export function registerGroupsMutationDefaults(queryClient: QueryClient) {
  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.create,
    mutationFn: (name: string) => createGroup(name),
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.update,
    mutationFn: ({ id, updates }: { id: string; updates: UpdateGroup }) => updateGroup(id, updates),
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteGroup(id),
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.addMember,
    mutationFn: ({ groupId, email }: { groupId: string; email: string }) =>
      addGroupMember(groupId, email),
    // Broader than the live hook's own invalidation (which targets just
    // this group's member list) — a resumed mutation has no per-group
    // context to invalidate precisely, so it invalidates the whole
    // "groups" prefix, which query-key matching already covers
    // (["groups"] matches ["groups","members",groupId] too).
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.removeMember,
    mutationFn: ({ memberId }: { groupId: string; memberId: string }) =>
      removeGroupMember(memberId),
    invalidateKey: GROUPS_QUERY_KEY,
  });
}
