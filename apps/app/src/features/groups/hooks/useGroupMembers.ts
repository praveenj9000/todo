import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MutateOptions } from "@tanstack/react-query";

import {
  cancelListQuery,
  getFlatListCache,
  invalidateList,
  setFlatListCache,
} from "@todo/query-toolkit";

import { addGroupMember, getGroupMembers, removeGroupMember } from "../api/groups";
import { groupMembersQueryKey } from "../constants/query-keys";
import { GROUP_MUTATION_KEYS } from "../constants/mutation-keys";
import type { GroupMember } from "../types/group";

export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: groupMembersQueryKey(groupId ?? ""),
    queryFn: () => getGroupMembers(groupId as string),
    enabled: Boolean(groupId),
  });
}

/** A member row not yet confirmed by the server — the email was
 * accepted locally, but `add_group_member_by_email` hasn't resolved
 * (or run at all, if queued offline) to know it's a real account. */
function buildPendingMember(email: string): GroupMember {
  return {
    id: `pending:${crypto.randomUUID()}`,
    user_id: "",
    email,
    added_at: new Date().toISOString(),
  };
}

type AddMemberVariables = { groupId: string; email: string };
type RemoveMemberVariables = { groupId: string; memberId: string };

function useAddGroupMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: GROUP_MUTATION_KEYS.addMember,
    mutationFn: ({ groupId, email }: AddMemberVariables) => addGroupMember(groupId, email),

    async onMutate({ groupId, email }) {
      const queryKey = groupMembersQueryKey(groupId);
      await cancelListQuery(queryClient, queryKey);

      const previousItems = getFlatListCache<GroupMember>(queryClient, queryKey);
      setFlatListCache(queryClient, queryKey, [...previousItems, buildPendingMember(email)]);

      return { previousItems, queryKey };
    },

    onError(_error, _variables, context) {
      if (!context) return;
      setFlatListCache(queryClient, context.queryKey, context.previousItems);
    },

    onSettled(_data, _error, { groupId }) {
      invalidateList(queryClient, groupMembersQueryKey(groupId));
    },
  });
}

function useRemoveGroupMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: GROUP_MUTATION_KEYS.removeMember,
    mutationFn: ({ memberId }: RemoveMemberVariables) => removeGroupMember(memberId),

    async onMutate({ groupId, memberId }) {
      const queryKey = groupMembersQueryKey(groupId);
      await cancelListQuery(queryClient, queryKey);

      const previousItems = getFlatListCache<GroupMember>(queryClient, queryKey);
      setFlatListCache(
        queryClient,
        queryKey,
        previousItems.filter((member) => member.id !== memberId),
      );

      return { previousItems, queryKey };
    },

    onError(_error, _variables, context) {
      if (!context) return;
      setFlatListCache(queryClient, context.queryKey, context.previousItems);
    },

    onSettled(_data, _error, { groupId }) {
      invalidateList(queryClient, groupMembersQueryKey(groupId));
    },
  });
}

/**
 * Convenience wrapper scoped to one group. Exposes the same
 * `addMember.mutate(email)` / `removeMember.mutate(memberId)` shape
 * components already use — but the variables actually handed to
 * TanStack Query (and therefore persisted for offline resume) are the
 * self-contained `{ groupId, ... }` shape above, not a closure.
 */
export function useGroupMemberMutations(groupId: string) {
  const addMemberMutation = useAddGroupMemberMutation();
  const removeMemberMutation = useRemoveGroupMemberMutation();

  return {
    addMember: {
      ...addMemberMutation,
      mutate: (email: string, options?: MutateOptions<GroupMember, Error, AddMemberVariables>) =>
        addMemberMutation.mutate({ groupId, email }, options),
      mutateAsync: (email: string) => addMemberMutation.mutateAsync({ groupId, email }),
    },
    removeMember: {
      ...removeMemberMutation,
      mutate: (memberId: string, options?: MutateOptions<void, Error, RemoveMemberVariables>) =>
        removeMemberMutation.mutate({ groupId, memberId }, options),
      mutateAsync: (memberId: string) => removeMemberMutation.mutateAsync({ groupId, memberId }),
    },
  };
}
