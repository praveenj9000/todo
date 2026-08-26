import { useState } from "react";

import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useGroups } from "@/features/groups/hooks/useGroups";

import type { GroupWithMembers } from "@/features/groups/types/group";
import { useListShares } from "../hooks/useListShares";
import { useShareMutations } from "../hooks/useShareMutations";

import type { List } from "../types/list";
import type { ListShare, SharePermission } from "../types/share";

type Props = {
  list: List;
  onClose: () => void;
};

function shareDisplayName(
  share: ListShare,
  groups: GroupWithMembers[],
): { name: string; type: "group" | "user" } {
  if (share.subject_type === "group") {
    const group = groups.find((candidate) => candidate.id === share.subject_id);
    return {
      name: group ? group.name : `Group (${share.subject_id.slice(0, 8)}...)`,
      type: "group",
    };
  }

  return { name: `${share.subject_id.slice(0, 8)}...`, type: "user" };
}

export function ShareSettings({ list, onClose }: Props) {
  const { data: shares = [] } = useListShares(list.id);
  const { data: groups = [] } = useGroups();
  const { addShare, changePermission, removeShare, setPublicAccess } = useShareMutations(list.id);

  const [userId, setUserId] = useState("");
  const [permission, setPermission] = useState<SharePermission>("read");

  const shareUrl = `${window.location.origin}/share/${list.share_token}`;

  const sharedGroupIds = new Set(
    shares.filter((share) => share.subject_type === "group").map((share) => share.subject_id),
  );
  const availableGroups = groups.filter((group) => !sharedGroupIds.has(group.id));

  function handleAddUser() {
    const id = userId.trim();

    if (!id) {
      return;
    }

    addShare.mutate({ subjectType: "user", subjectId: id, permission });
    setUserId("");
  }

  function handleAddGroup(groupId: string) {
    addShare.mutate({ subjectType: "group", subjectId: groupId, permission });
  }

  function handleTogglePublicRead() {
    setPublicAccess.mutate({
      publicRead: !list.public_read,
      publicEdit: list.public_edit,
    });
  }

  function handleTogglePublicEdit() {
    setPublicAccess.mutate({
      publicRead: list.public_read,
      publicEdit: !list.public_edit,
    });
  }
  return (
    <YStack
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      width={320}
      backgroundColor="$background"
      borderLeftWidth={1}
      borderColor="$borderColor"
      padding="$4"
      gap="$3"
      zIndex={10}
      overflow="scroll"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold" fontSize="$5">
          Share &quot;{list.name}&quot;
        </Text>
        <Button size="$2" chromeless onPress={onClose}>
          ✕
        </Button>
      </XStack>

      <YStack gap="$2">
        <Text fontWeight="bold">Public access</Text>

        <XStack gap="$2" alignItems="center">
          <Button
            flex={1}
            size="$2"
            theme={list.public_read ? "active" : undefined}
            onPress={handleTogglePublicRead}
          >
            {list.public_read ? "✓ Public read" : "Public read"}
          </Button>
          <Button
            flex={1}
            size="$2"
            theme={list.public_edit ? "active" : undefined}
            onPress={handleTogglePublicEdit}
          >
            {list.public_edit ? "✓ Public edit" : "Public edit"}
          </Button>
        </XStack>

        <Text fontSize="$2" color="$color11">
          Anyone with the link can{" "}
          {list.public_read || list.public_edit ? "view or edit" : "do nothing (link disabled)"}.
        </Text>

        <Input value={shareUrl} readOnly selectTextOnFocus />
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="bold">Share with a specific user</Text>

        <XStack gap="$2">
          <Input
            flex={1}
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
            onSubmitEditing={handleAddUser}
          />
          <Button
            size="$2"
            theme={permission === "edit" ? "active" : undefined}
            onPress={() => setPermission(permission === "read" ? "edit" : "read")}
          >
            {permission}
          </Button>
          <Button size="$2" onPress={handleAddUser}>
            Add
          </Button>
        </XStack>
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="bold">Share with a group</Text>

        {groups.length === 0 ? (
          <Text fontSize="$2" color="$color11">
            No groups yet. Create one in Settings → Groups, then share it here.
          </Text>
        ) : null}

        {groups.length > 0 && availableGroups.length === 0 ? (
          <Text fontSize="$2" color="$color11">
            Every group is already shared on this list.
          </Text>
        ) : null}

        {availableGroups.map((group) => (
          <XStack key={group.id} gap="$2" alignItems="center">
            <Text flex={1} fontSize="$2" numberOfLines={1}>
              {group.name} ({group.group_members.length} member
              {group.group_members.length === 1 ? "" : "s"})
            </Text>
            <Button size="$2" onPress={() => handleAddGroup(group.id)}>
              Add ({permission})
            </Button>
          </XStack>
        ))}
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="bold">Shared with</Text>

        {shares.length === 0 ? (
          <Text fontSize="$2" color="$color11">
            No one is shared on this list yet.
          </Text>
        ) : (
          shares.map((share: ListShare) => {
            const { name, type } = shareDisplayName(share, groups);

            return (
              <XStack key={share.id} gap="$2" alignItems="center">
                <Text flex={1} fontSize="$2" numberOfLines={1}>
                  {type === "group" ? "👥 " : ""}
                  {name}
                </Text>
                <Button
                  size="$2"
                  chromeless
                  onPress={() =>
                    changePermission.mutate({
                      id: share.id,
                      permission: share.permission === "read" ? "edit" : "read",
                    })
                  }
                >
                  {share.permission}
                </Button>
                <Button
                  size="$2"
                  chromeless
                  theme="red"
                  onPress={() => removeShare.mutate(share.id)}
                >
                  ✕
                </Button>
              </XStack>
            );
          })
        )}
      </YStack>
    </YStack>
  );
}
