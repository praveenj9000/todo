import { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useGroups } from "../hooks/useGroups";
import { useGroupMutations } from "../hooks/useGroupMutations";
import type { OptimisticGroup } from "../hooks/useGroupMutations";
import { GroupEditor } from "./GroupEditor";

export function GroupsTab() {
  const { data: groups = [] } = useGroups();
  const { createGroupMutation, updateGroupMutation, deleteGroupMutation } = useGroupMutations();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleCreate() {
    const value = newName.trim();
    if (!value) return;

    setNewName("");
    // No onSuccess jump into the editor here — the real id isn't known
    // until the server (or, offline, a later reconnect) confirms the
    // create. The row shows as "Saving…" in the meantime; Manage
    // becomes available once it syncs.
    createGroupMutation.mutate(value);
  }

  const editingGroup = groups.find((g) => g.id === editingId) ?? null;

  if (editingGroup) {
    return (
      <GroupEditor
        group={editingGroup}
        onRename={(name) => updateGroupMutation.mutate({ id: editingGroup.id, updates: { name } })}
        onClose={() => setEditingId(null)}
      />
    );
  }

  return (
    <YStack gap="$3" padding="$4">
      <XStack gap="$2">
        <Input
          flex={1}
          placeholder="New group name"
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={handleCreate}
        />
        <Button onPress={handleCreate}>Create</Button>
      </XStack>

      {createGroupMutation.error ? (
        <Text fontSize="$2" color="$red10">
          {(createGroupMutation.error as Error).message}
        </Text>
      ) : null}

      {groups.length === 0 ? (
        <Text color="$color11">No groups yet.</Text>
      ) : (
        (groups as OptimisticGroup[]).map((group) => {
          const isPending = Boolean(group._pending);

          return (
            <XStack key={group.id} justifyContent="space-between" alignItems="center" gap="$2">
              <Text flex={1}>{group.name}</Text>

              {isPending ? (
                <Text fontSize="$2" color="$color11">
                  Saving…
                </Text>
              ) : (
                <>
                  <Button size="$2" onPress={() => setEditingId(group.id)}>
                    Manage
                  </Button>
                  <Button
                    size="$2"
                    theme="red"
                    onPress={() => deleteGroupMutation.mutate(group.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </XStack>
          );
        })
      )}
    </YStack>
  );
}
