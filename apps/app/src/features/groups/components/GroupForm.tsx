import { useState } from "react";

import { Button, Input, Label, Text, XStack, YStack } from "tamagui";

import { useCreateGroup } from "../hooks/useCreateGroup";
import { useUpdateGroup } from "../hooks/useUpdateGroup";
import { EmailMembersInput } from "./EmailMembersInput";

import type { GroupWithMembers } from "../types/group";

type Props = {
  /** When provided the form edits this group, otherwise it creates a new one. */
  initial?: GroupWithMembers;
  onCancel: () => void;
  onSaved: (group: GroupWithMembers) => void;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function GroupForm({ initial, onCancel, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [memberEmails, setMemberEmails] = useState(
    initial?.group_members.map((member) => member.email) ?? [],
  );
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();

  const isEditing = initial !== undefined;
  const isSaving = isCreating || isUpdating;

  function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Group name is required.");
      return;
    }

    const input = {
      name: trimmedName,
      memberEmails,
    };

    if (isEditing) {
      updateGroup(
        { id: initial.id, input },
        {
          onSuccess: onSaved,
          onError: (error) => setFormError(errorMessage(error, "Could not save the group.")),
        },
      );
    } else {
      createGroup(input, {
        onSuccess: onSaved,
        onError: (error) => setFormError(errorMessage(error, "Could not create the group.")),
      });
    }
  }

  return (
    <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$4" padding="$4" gap="$3">
      <Text fontWeight="bold" fontSize="$5">
        {isEditing ? `Edit "${initial.name}"` : "New group"}
      </Text>

      <YStack gap="$1">
        <Label htmlFor="group-name" fontSize="$3" color="$color11">
          Group name
        </Label>
        <Input
          id="group-name"
          aria-label="Group name"
          placeholder="e.g. Engineering squad"
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (formError) {
              setFormError(null);
            }
          }}
          disabled={isSaving}
          autoFocus={!isEditing}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </YStack>

      <YStack gap="$1">
        <Label fontSize="$3" color="$color11">
          Members
        </Label>
        <Text fontSize="$2" color="$color11">
          Type an email address and press Enter (or comma) to add each member.
        </Text>
        <EmailMembersInput
          values={memberEmails}
          onChange={(values) => {
            setMemberEmails(values);
            if (formError) {
              setFormError(null);
            }
          }}
          disabled={isSaving}
        />
      </YStack>

      {formError ? (
        <Text fontSize="$2" color="$red10" role="alert">
          {formError}
        </Text>
      ) : null}

      <XStack justifyContent="flex-end" gap="$2">
        <Button variant="outlined" disabled={isSaving} onPress={onCancel}>
          Cancel
        </Button>
        <Button disabled={isSaving} onPress={handleSave}>
          {isEditing ? "Save changes" : "Create group"}
        </Button>
      </XStack>
    </YStack>
  );
}
