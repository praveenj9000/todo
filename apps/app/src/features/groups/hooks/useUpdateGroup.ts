import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateList } from "@todo/query-toolkit";

import { updateGroup } from "../api/groups";
import { GROUPS_QUERY_KEY } from "../constants/query-keys";
import { GROUP_MUTATION_KEYS } from "../constants/mutation-keys";

import type { GroupInput } from "../types/group";

type UpdateGroupInput = {
  id: string;
  input: GroupInput;
};

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: GROUP_MUTATION_KEYS.update,
    mutationFn: ({ id, input }: UpdateGroupInput) => updateGroup(id, input),
    onSettled: () => {
      invalidateList(queryClient, GROUPS_QUERY_KEY);
    },
  });
}
