import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addListShare,
  addListShareForGroup,
  removeListShare,
  updateListPublicAccess,
  updateListShare,
} from "../api/shares";

import type { SharePermission, ShareSubjectType } from "../types/share";

export function useShareMutations(listId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["lists", "shares", listId] });
    queryClient.invalidateQueries({ queryKey: ["lists"] });
  };

  const addShare = useMutation({
    mutationFn: (input: {
      subjectType: ShareSubjectType;
      email: string;
      permission: SharePermission;
    }) => addListShare({ listId, ...input }),
    onSettled: invalidate,
  });

  const changePermission = useMutation({
    mutationFn: ({ id, permission }: { id: string; permission: SharePermission }) =>
      updateListShare(id, permission),
    onSettled: invalidate,
  });

  const removeShare = useMutation({
    mutationFn: (id: string) => removeListShare(id),
    onSettled: invalidate,
  });

  const setPublicAccess = useMutation({
    mutationFn: (input: { publicRead: boolean; publicEdit: boolean }) =>
      updateListPublicAccess({ listId, ...input }),
    onSettled: invalidate,
  });

  const addShareByGroup = useMutation({
    mutationFn: (input: { groupId: string; permission: SharePermission }) =>
      addListShareForGroup({ listId, groupId: input.groupId, permission: input.permission }),
    onSettled: invalidate,
  });

  return { addShare, addShareByGroup, changePermission, removeShare, setPublicAccess };
}
