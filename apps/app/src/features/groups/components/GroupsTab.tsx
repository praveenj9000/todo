import { useState } from "react";

import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

import { ErrorState, Loading } from "@todo/design-system";

import { useDeleteGroup } from "../hooks/useDeleteGroup";
import { useGroups } from "../hooks/useGroups";
import { GroupForm } from "./GroupForm";

import type { GroupWithMembers } from "../types/group";

const CONFIRM_TIMEOUT_MS = 3000;

export function GroupsTab() {
  const { data: groups = [], isPending, isError, refetch } = useGroups();
  const { mutate: deleteGroup } = useDeleteGroup();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<GroupWithMembers | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const formOpen = creating || editing !== null;

  function handleNewGroup() {
    setEditing(null);
    setCreating(true);
  }

  function handleEditGroup(group: GroupWithMembers) {
    setCreating(false);
    setEditing(group);
  }

  function handleCloseForm() {
    setCreating(false);
    setEditing(null);
  }

  function handleSaved() {
    handleCloseForm();
  }

  function handleDeleteClick(group: GroupWithMembers) {
    if (confirmingDeleteId !== group.id) {
      setConfirmingDeleteId(group.id);
      setTimeout(() => {
        setConfirmingDeleteId((current) => (current === group.id ? null : current));
      }, CONFIRM_TIMEOUT_MS);
      return;
    }

    setConfirmingDeleteId(null);
    deleteGroup(group.id);
  }

  return (
    <ScrollView flex={1} contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <YStack width="100%" maxWidth={640} alignSelf="center" gap="$4">
        <XStack justifyContent="space-between" alignItems="center" gap="$2">
          <Text fontWeight="bold" fontSize="$6">
            Groups
          </Text>
          <Button disabled={formOpen} onPress={handleNewGroup}>
            New group
          </Button>
        </XStack>

        {formOpen ? (
          <GroupForm
            initial={editing ?? undefined}
            onCancel={handleCloseForm}
            onSaved={handleSaved}
          />
        ) : null}

        {isPending ? <Loading /> : null}

        {isError ? (
          <ErrorState title="Could not load your groups." onRetry={() => void refetch()} />
        ) : null}

        {!isPending && !isError && groups.length === 0 ? (
          <Text color="$color11" textAlign="center" paddingVertical="$6">
            No groups yet. Create one to start organizing your team.
          </Text>
        ) : null}

        {!isPending && !isError && groups.length > 0 ? (
          <YStack gap="$2">
            {groups.map((group) => {
              const memberCount = group.group_members.length;

              return (
                <XStack
                  key={group.id}
                  alignItems="center"
                  gap="$2"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderRadius="$4"
                  padding="$3"
                >
                  <YStack flex={1} gap="$1" minWidth={0}>
                    <Text fontWeight="bold" numberOfLines={1}>
                      {group.name}
                    </Text>
                    <Text fontSize="$2" color="$color11">
                      {memberCount} member{memberCount === 1 ? "" : "s"}
                    </Text>
                  </YStack>

                  <Button size="$2" disabled={formOpen} onPress={() => handleEditGroup(group)}>
                    Edit
                  </Button>
                  <Button
                    size="$2"
                    theme="red"
                    disabled={formOpen}
                    onPress={() => handleDeleteClick(group)}
                  >
                    {confirmingDeleteId === group.id ? "Confirm?" : "Delete"}
                  </Button>
                </XStack>
              );
            })}
          </YStack>
        ) : null}
      </YStack>
    </ScrollView>
  );
}
