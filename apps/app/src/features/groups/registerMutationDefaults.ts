import type { QueryClient } from "@tanstack/react-query";

import { registerListMutationDefaults } from "@todo/query-toolkit";

import { createGroup, deleteGroup, updateGroup } from "./api/groups";

import { GROUPS_QUERY_KEY } from "./constants/query-keys";
import { GROUP_MUTATION_KEYS } from "./constants/mutation-keys";

import type { GroupInput } from "./types/group";

export function registerGroupsMutationDefaults(queryClient: QueryClient) {
  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.create,
    mutationFn: createGroup,
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.update,
    mutationFn: ({ id, input }: { id: string; input: GroupInput }) => updateGroup(id, input),
    invalidateKey: GROUPS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: GROUP_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteGroup(id),
    invalidateKey: GROUPS_QUERY_KEY,
  });
}
