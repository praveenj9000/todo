import { useState } from "react";
import type { ReactNode } from "react";

import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useGroupsWithMemberCounts } from "@/features/groups/hooks/useGroupsWithMemberCounts";

import type { GroupWithMemberCount } from "@/features/groups/types/group";
import { useListShares } from "../hooks/useListShares";
import { useShareMutations } from "../hooks/useShareMutations";

import type { List } from "../types/list";
import type { ListShare, SharePermission } from "../types/share";

type Props = {
  list: List;
  onClose: () => void;
};

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$5" padding="$3" gap="$3">
      <Text fontWeight="600" fontSize="$3">
        {title}
      </Text>
      {children}
    </YStack>
  );
}

function Toggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Button
      unstyled
      width={44}
      height={26}
      borderRadius={999}
      backgroundColor={checked ? "$blue10" : "$color6"}
      padding={2}
      justifyContent="center"
      onPress={() => onCheckedChange(!checked)}
      pressStyle={{ opacity: 0.85 }}
      aria-label={checked ? "On" : "Off"}
    >
      <YStack
        width={22}
        height={22}
        borderRadius={999}
        backgroundColor="white"
        animation="quick"
        x={checked ? 18 : 0}
      />
    </Button>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <XStack alignItems="center" gap="$3">
      <YStack
        width={36}
        height={36}
        borderRadius="$10"
        backgroundColor="$color4"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$4">{icon}</Text>
      </YStack>
      <YStack flex={1}>
        <Text fontSize="$3" fontWeight="500">
          {title}
        </Text>
        <Text fontSize="$2" color="$color11">
          {description}
        </Text>
      </YStack>
      <Toggle checked={checked} onCheckedChange={onCheckedChange} />
    </XStack>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <XStack
      alignItems="center"
      gap="$1"
      backgroundColor="$color4"
      borderRadius="$10"
      paddingLeft="$3"
      paddingRight="$1"
      paddingVertical="$1"
    >
      <Text fontSize="$2" numberOfLines={1}>
        {label}
      </Text>
      <Button size="$1" chromeless circular onPress={onRemove} aria-label={`Remove ${label}`}>
        ✕
      </Button>
    </XStack>
  );
}

function ChipRow({
  label,
  chips,
  onRemove,
  renderAdd,
}: {
  label: string;
  chips: { id: string; label: string }[];
  onRemove: (id: string) => void;
  renderAdd: (close: () => void) => ReactNode;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <YStack gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$2" color="$color11">
          {label}
        </Text>
        <Button size="$1" chromeless onPress={() => setAdding((value) => !value)}>
          {adding ? "Cancel" : "+ Add"}
        </Button>
      </XStack>

      <XStack flexWrap="wrap" gap="$2">
        {chips.length === 0 ? (
          <Text fontSize="$2" color="$color11">
            None yet
          </Text>
        ) : (
          chips.map((chip) => (
            <Chip key={chip.id} label={chip.label} onRemove={() => onRemove(chip.id)} />
          ))
        )}
      </XStack>

      {adding ? renderAdd(() => setAdding(false)) : null}
    </YStack>
  );
}

function shareLabel(share: ListShare, groups: GroupWithMemberCount[]): string {
  if (share.subject_type === "group") {
    const group = groups.find((candidate) => candidate.id === share.subject_id);
    return group ? group.name : `Group (${share.subject_id.slice(0, 8)}...)`;
  }
  return `${share.subject_id.slice(0, 8)}...`;
}

export function ShareSettings({ list, onClose }: Props) {
  const { data: shares = [] } = useListShares(list.id);
  const { data: groups = [] } = useGroupsWithMemberCounts();
  const { addShare, addShareByGroup, removeShare, setPublicAccess } = useShareMutations(list.id);

  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${list.share_token}`;

  const groupShares = shares.filter((share) => share.subject_type === "group");
  const userShares = shares.filter((share) => share.subject_type === "user");
  const sharedGroupIds = new Set(groupShares.map((share) => share.subject_id));
  const availableGroups = groups.filter((group) => !sharedGroupIds.has(group.id));

  const showPerSubjectAccess = !list.public_edit;

  function handleReadToggle(checked: boolean) {
    // Turning read off while edit is on would leave "public edit" claiming
    // access nobody can reach — turn edit off too in that case.
    setPublicAccess.mutate({
      publicRead: checked,
      publicEdit: checked ? list.public_edit : false,
    });
  }

  function handleEditToggle(checked: boolean) {
    // Edit always implies read.
    setPublicAccess.mutate({
      publicRead: checked ? true : list.public_read,
      publicEdit: checked,
    });
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser — the link is still
      // selectable and copyable by hand, so this fails quietly.
    }
  }

  function addGroupChip(groupId: string, permission: SharePermission, close: () => void) {
    addShareByGroup.mutate({ groupId, permission }, { onSuccess: close });
  }

  function AddGroupPicker({
    permission,
    close,
  }: {
    permission: SharePermission;
    close: () => void;
  }) {
    if (availableGroups.length === 0) {
      return (
        <Text fontSize="$2" color="$color11">
          {groups.length === 0
            ? "No groups yet — create one in Settings → Groups."
            : "Every group already has access."}
        </Text>
      );
    }

    return (
      <YStack gap="$1" borderWidth={1} borderColor="$borderColor" borderRadius="$4" padding="$2">
        {availableGroups.map((group) => (
          <Button
            key={group.id}
            size="$2"
            chromeless
            justifyContent="flex-start"
            onPress={() => addGroupChip(group.id, permission, close)}
          >
            {group.name} ({group.member_count})
          </Button>
        ))}
      </YStack>
    );
  }

  function AddUserPicker({
    permission,
    close,
  }: {
    permission: SharePermission;
    close: () => void;
  }) {
    const [email, setEmail] = useState("");

    function submit() {
      const value = email.trim();
      if (!value) return;

      addShare.mutate({ subjectType: "user", email: value, permission }, { onSuccess: close });
    }

    return (
      <YStack gap="$1">
        <XStack gap="$2">
          <Input
            flex={1}
            size="$3"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={submit}
            autoFocus
          />
          <Button size="$2" onPress={submit}>
            Add
          </Button>
        </XStack>
        {addShare.error ? (
          <Text fontSize="$2" color="$red10">
            {(addShare.error as Error).message}
          </Text>
        ) : null}
      </YStack>
    );
  }

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.5)"
      alignItems="center"
      justifyContent="center"
      zIndex={10}
      padding="$4"
    >
      {/* Backdrop — tapping outside the card closes the panel. */}
      <YStack position="absolute" top={0} left={0} right={0} bottom={0} onPress={onClose} />

      <YStack
        width="100%"
        maxWidth={440}
        maxHeight="90%"
        backgroundColor="$background"
        borderRadius="$6"
        borderWidth={1}
        borderColor="$borderColor"
        overflow="hidden"
      >
        <XStack
          justifyContent="space-between"
          alignItems="flex-start"
          padding="$4"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <YStack flex={1} gap="$1">
            <Text fontWeight="bold" fontSize="$5">
              Share access settings
            </Text>
            <Text fontSize="$2" color="$color11" numberOfLines={1}>
              Configure who can access &quot;{list.name}&quot;
            </Text>
          </YStack>
          <Button size="$2" chromeless onPress={onClose} aria-label="Close">
            ✕
          </Button>
        </XStack>

        <YStack padding="$4" gap="$4" overflow="scroll">
          <YStack gap="$2">
            <Text fontSize="$2" fontWeight="600" color="$color11">
              SHARE LINK
            </Text>
            <XStack gap="$2">
              <Input flex={1} defaultValue={shareUrl} editable={false} selectTextOnFocus />
              <Button size="$3" onPress={handleCopyLink}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </XStack>
            <Text fontSize="$1" color="$color11">
              This link can be shared with anyone who has access.
            </Text>
          </YStack>

          <Card title="Public Access">
            <ToggleRow
              icon="🌐"
              title="Anyone with the link can read"
              description="No sign-in required to view."
              checked={list.public_read}
              onCheckedChange={handleReadToggle}
            />
            <ToggleRow
              icon="✏️"
              title="Anyone with the link can edit"
              description="No sign-in required to make changes."
              checked={list.public_edit}
              onCheckedChange={handleEditToggle}
            />
          </Card>

          {showPerSubjectAccess ? (
            <>
              <Card title="Group Access">
                <ChipRow
                  label="Groups with read-only access"
                  chips={groupShares
                    .filter((share) => share.permission === "read")
                    .map((share) => ({ id: share.id, label: shareLabel(share, groups) }))}
                  onRemove={(id) => removeShare.mutate(id)}
                  renderAdd={(close) => <AddGroupPicker permission="read" close={close} />}
                />
                <ChipRow
                  label="Groups with edit access"
                  chips={groupShares
                    .filter((share) => share.permission === "edit")
                    .map((share) => ({ id: share.id, label: shareLabel(share, groups) }))}
                  onRemove={(id) => removeShare.mutate(id)}
                  renderAdd={(close) => <AddGroupPicker permission="edit" close={close} />}
                />
              </Card>

              <Card title="User Access">
                <ChipRow
                  label="Users with read-only access"
                  chips={userShares
                    .filter((share) => share.permission === "read")
                    .map((share) => ({ id: share.id, label: shareLabel(share, groups) }))}
                  onRemove={(id) => removeShare.mutate(id)}
                  renderAdd={(close) => <AddUserPicker permission="read" close={close} />}
                />
                <ChipRow
                  label="Users with edit access"
                  chips={userShares
                    .filter((share) => share.permission === "edit")
                    .map((share) => ({ id: share.id, label: shareLabel(share, groups) }))}
                  onRemove={(id) => removeShare.mutate(id)}
                  renderAdd={(close) => <AddUserPicker permission="edit" close={close} />}
                />
              </Card>
            </>
          ) : (
            <Text fontSize="$2" color="$color11">
              Public edit is on, so everyone with the link already has full access. Turn it off
              above to grant access to specific groups or people instead.
            </Text>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}
