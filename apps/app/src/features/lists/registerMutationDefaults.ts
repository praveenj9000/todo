import type { QueryClient } from "@tanstack/react-query";

import { registerListMutationDefaults } from "@todo/query-toolkit";

import { createList, deleteList, updateList } from "./api/lists";

import { LISTS_QUERY_KEY } from "./constants/query-keys";
import { LIST_MUTATION_KEYS } from "./constants/mutation-keys";

import type { UpdateList } from "./types/list";

export function registerListsMutationDefaults(queryClient: QueryClient) {
  registerListMutationDefaults(queryClient, {
    mutationKey: LIST_MUTATION_KEYS.create,
    mutationFn: createList,
    invalidateKey: LISTS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: LIST_MUTATION_KEYS.update,
    mutationFn: ({ id, updates }: { id: string; updates: UpdateList }) => updateList(id, updates),
    invalidateKey: LISTS_QUERY_KEY,
  });

  registerListMutationDefaults(queryClient, {
    mutationKey: LIST_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteList(id),
    invalidateKey: LISTS_QUERY_KEY,
  });
}
