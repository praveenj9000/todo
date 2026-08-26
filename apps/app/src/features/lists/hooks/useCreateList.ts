import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { createList } from "../api/lists";
import { LISTS_QUERY_KEY } from "../constants/query-keys";
import { LIST_MUTATION_KEYS } from "../constants/mutation-keys";

import type { NewList } from "../types/list";

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: LIST_MUTATION_KEYS.create,
    mutationFn: (input: Pick<NewList, "name" | "type">) => createList(input),
    onSettled: () => {
      invalidateList(queryClient, LISTS_QUERY_KEY);
    },
  });
}
