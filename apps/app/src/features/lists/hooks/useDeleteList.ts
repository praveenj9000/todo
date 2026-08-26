import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { deleteList } from "../api/lists";
import { LISTS_QUERY_KEY } from "../constants/query-keys";
import { LIST_MUTATION_KEYS } from "../constants/mutation-keys";

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: LIST_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteList(id),
    onSettled: () => {
      invalidateList(queryClient, LISTS_QUERY_KEY);
      invalidateList(queryClient, ["tasks"]);
    },
  });
}
