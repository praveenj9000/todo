import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { updateList } from "../api/lists";
import { LISTS_QUERY_KEY } from "../constants/query-keys";
import { LIST_MUTATION_KEYS } from "../constants/mutation-keys";

import type { UpdateList } from "../types/list";

type UpdateListInput = { id: string; updates: UpdateList };

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: LIST_MUTATION_KEYS.update,
    mutationFn: ({ id, updates }: UpdateListInput) => updateList(id, updates),
    onSettled: () => {
      invalidateList(queryClient, LISTS_QUERY_KEY);
    },
  });
}
