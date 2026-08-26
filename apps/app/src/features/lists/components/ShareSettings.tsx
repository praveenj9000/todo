import { useState } from "react";

import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useListShares } from "../hooks/useListShares";
import { useShareMutations } from "../hooks/useShareMutations";

import type { List } from "../types/list";
import type { ListShare, SharePermission } from "../types/share";

type Props = {
  list: List;
  onClose: () => void;
};

export function ShareSettings({ list, onClose }: Props) {
  const { data: shares = [] } = useListShares(list.id);
  const { addShare, changePermission, removeShare, setPublicAccess } = useShareMutations(list.id);

  const [userId, setUserId] = useState("");
  const [permission, setPermission] = useState<SharePermission>("read");

  const shareUrl = `${window.location.origin}/share/${list.share_token}`;

  function handleAddUser() {
    const id = userId.trim();

    if (!id) {
      return;
    }

    addShare.mutate({ subjectType: "user", subjectId: id, permission });
    setUserId("");
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
          Anyone with the link can {list.public_read ? "view" : ""}
          {list.public_read && list.public_edit ? " and " : ""}
          {list.public_edit ? "edit" : ""}
          {!list.public_read && !list.public_edit ? "do nothing (link disabled)" : ""}.
        </Text>

        <Input value={shareUrl} editable={false} selectTextOnFocus />
      </YStack>

      <YStack gap="$2">
        <Text fontWeight="bold">Share with specific users</Text>

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

        {shares.length === 0 ? (
          <Text fontSize="$2" color="$color11">
            No users shared yet.
          </Text>
        ) : (
          shares.map((share: ListShare) => (
            <XStack key={share.id} gap="$2" alignItems="center">
              <Text flex={1} fontSize="$2">
                {share.subject_id.slice(0, 8)}...
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
              <Button size="$2" chromeless theme="red" onPress={() => removeShare.mutate(share.id)}>
                ✕
              </Button>
            </XStack>
          ))
        )}
      </YStack>
    </YStack>
  );
}
