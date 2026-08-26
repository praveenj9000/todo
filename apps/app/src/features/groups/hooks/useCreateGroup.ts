import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { createGroup } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";
import { GROUP_MUTATION_KEYS } from "../constants/mutation-keys";

import type { GroupInput } from "../types/group";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: GROUP_MUTATION_KEYS.create,
    mutationFn: (input: GroupInput) => createGroup(input),
    onSettled: () => {
      invalidateList(queryClient, GROUPS_QUERY_KEY);
    },
  });
}
