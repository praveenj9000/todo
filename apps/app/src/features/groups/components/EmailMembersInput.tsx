import { useState } from "react";

import { Button, Input, Text, XStack, YStack } from "tamagui";

import { isValidEmail, normalizeEmail } from "../utils/email";

const EMAIL_DELIMITERS = /[,;]/;
const INVALID_MESSAGE = "Enter a valid email address.";
const DUPLICATE_MESSAGE = "That email is already in the list.";

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
};

/**
 * Free-form email tag input. Members are typed directly as text and
 * committed one at a time as chips (Enter, comma, semicolon, or Add).
 * There is intentionally no dropdown/user picker.
 */
export function EmailMembersInput({ values, onChange, disabled = false }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function commitCandidates(rawCandidates: string[]) {
    const next = [...values];
    let pendingError: string | null = null;

    for (const raw of rawCandidates) {
      const email = normalizeEmail(raw);

      if (!email) {
        continue;
      }

      if (!isValidEmail(email)) {
        pendingError = INVALID_MESSAGE;
        continue;
      }

      if (next.includes(email)) {
        pendingError = DUPLICATE_MESSAGE;
        continue;
      }

      next.push(email);
    }

    if (next.length !== values.length) {
      onChange(next);
    }

    setError(pendingError);
  }

  function handleChangeText(text: string) {
    if (EMAIL_DELIMITERS.test(text)) {
      const parts = text.split(EMAIL_DELIMITERS);
      const tail = parts.pop() ?? "";
      commitCandidates(parts);
      setDraft(tail);
      return;
    }

    setDraft(text);
    if (error) {
      setError(null);
    }
  }

  function handleSubmit() {
    const value = draft;
    setDraft("");
    commitCandidates([value]);
  }

  function handleRemove(email: string) {
    onChange(values.filter((candidate) => candidate !== email));
  }

  function handleBackspaceOnEmptyDraft() {
    if (!draft && !disabled && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <YStack gap="$2">
      <XStack
        flexWrap="wrap"
        alignItems="center"
        gap="$2"
        borderWidth={1}
        borderColor={error ? "$red10" : "$borderColor"}
        borderRadius="$4"
        padding="$2"
      >
        {values.map((email) => (
          <XStack
            key={email}
            gap="$1"
            alignItems="center"
            backgroundColor="$color4"
            borderRadius="$full"
            paddingLeft="$3"
            paddingRight="$1"
            paddingVertical="$1"
          >
            <Text fontSize="$2">{email}</Text>
            <Button
              size="$1"
              chromeless
              aria-label={`Remove ${email}`}
              disabled={disabled}
              onPress={() => handleRemove(email)}
            >
              ✕
            </Button>
          </XStack>
        ))}

        <Input
          flexGrow={1}
          flexBasis={200}
          minWidth={160}
          borderWidth={0}
          paddingHorizontal="$2"
          paddingVertical="$1"
          placeholder={
            values.length === 0 ? "john@example.com, jane@example.com" : "Add a member email..."
          }
          value={draft}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          onKeyPress={(event) => {
            if (event.nativeEvent.key === "Backspace") {
              handleBackspaceOnEmptyDraft();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              handleBackspaceOnEmptyDraft();
            }
          }}
          aria-label="Member email"
          disabled={disabled}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
        />

        <Button size="$2" disabled={disabled} onPress={handleSubmit}>
          Add
        </Button>
      </XStack>

      {error ? (
        <Text fontSize="$2" color="$red10" role="alert">
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}
