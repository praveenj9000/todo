import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { deleteGroup } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";
import { GROUP_MUTATION_KEYS } from "../constants/mutation-keys";

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: GROUP_MUTATION_KEYS.delete,
    mutationFn: (id: string) => deleteGroup(id),
    onSettled: () => {
      invalidateList(queryClient, GROUPS_QUERY_KEY);
    },
  });
}
