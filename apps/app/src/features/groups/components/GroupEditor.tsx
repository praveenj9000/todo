import { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useGroupMembers, useGroupMemberMutations } from "../hooks/useGroupMembers";
import { EmailMembersInput } from "./EmailMembersInput";
import type { Group } from "../types/group";

type Props = {
  group: Group;
  onRename: (name: string) => void;
  onClose: () => void;
};

export function GroupEditor({ group, onRename, onClose }: Props) {
  const [name, setName] = useState(group.name);

  const { data: members = [] } = useGroupMembers(group.id);
  const { addMember, removeMember } = useGroupMemberMutations(group.id);

  const memberEmails = members.map((member) => member.email);
  const isPending = addMember.isPending || removeMember.isPending;

  // EmailMembersInput is a controlled "final list" component — it hands
  // back the whole desired list on every change. We diff that against
  // the server-backed member list and fire one add/remove mutation per
  // difference, so each change is still its own persisted call (same
  // contract useGroupMemberMutations already had), not a batch save.
  function handleMembersChange(nextEmails: string[]) {
    const added = nextEmails.filter((email) => !memberEmails.includes(email));
    const removedMembers = members.filter((member) => !nextEmails.includes(member.email));

    added.forEach((email) => addMember.mutate(email));
    removedMembers.forEach((member) => removeMember.mutate(member.id));
  }

  return (
    <YStack gap="$3" padding="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Input
          flex={1}
          value={name}
          onChangeText={setName}
          onBlur={() => name.trim() && name !== group.name && onRename(name.trim())}
        />
        <Button size="$2" chromeless onPress={onClose}>
          Done
        </Button>
      </XStack>

      <Text fontWeight="bold">Members</Text>

      <EmailMembersInput
        values={memberEmails}
        disabled={isPending}
        onChange={handleMembersChange}
      />

      {addMember.error ? (
        <Text color="$red10" fontSize="$2">
          {(addMember.error as Error).message}
        </Text>
      ) : null}

      {members.length === 0 ? (
        <Text fontSize="$2" color="$color11">
          No members yet.
        </Text>
      ) : null}
    </YStack>
  );
}
