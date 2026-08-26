import { useState } from "react";

import { Button, Input, Text, XStack, YStack } from "tamagui";

import { useLists } from "../hooks/useLists";
import { useCreateList } from "../hooks/useCreateList";
import { useUpdateList } from "../hooks/useUpdateList";
import { useDeleteList } from "../hooks/useDeleteList";
import { useListsStore } from "../stores/lists-ui.store";
import { ShareSettings } from "./ShareSettings";

import type { List } from "../types/list";

const CONFIRM_TIMEOUT_MS = 3000;

export function ListSidebar() {
  const { data: lists = [] } = useLists();
  const selectedListId = useListsStore((state) => state.selectedListId);
  const setSelectedListId = useListsStore((state) => state.setSelectedListId);

  const { mutate: createList } = useCreateList();
  const { mutate: updateList } = useUpdateList();
  const { mutate: deleteList } = useDeleteList();

  const [newListName, setNewListName] = useState("");
  const [newListType, setNewListType] = useState<"todo" | "checklist">("todo");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [sharingListId, setSharingListId] = useState<string | null>(null);

  function handleCreate() {
    const name = newListName.trim();

    if (!name) {
      return;
    }

    createList(
      { name, type: newListType },
      {
        onSuccess: (created) => {
          setSelectedListId(created.id);
        },
      },
    );

    setNewListName("");
  }

  function handleRename(list: List) {
    const name = editingName.trim();

    if (!name) {
      setEditingId(null);
      return;
    }

    updateList({ id: list.id, updates: { name } });
    setEditingId(null);
  }

  function handleDeleteClick(list: List) {
    if (lists.length <= 1) {
      // Refuse rather than leave the user with zero lists — Bug 1's
      // fix means this would otherwise just show an empty state with
      // no obvious way back in except manually creating a new list.
      return;
    }

    if (confirmingDeleteId !== list.id) {
      setConfirmingDeleteId(list.id);
      setTimeout(() => {
        setConfirmingDeleteId((current) => (current === list.id ? null : current));
      }, CONFIRM_TIMEOUT_MS);
      return;
    }

    setConfirmingDeleteId(null);
    deleteList(list.id);

    if (selectedListId === list.id) {
      setSelectedListId(null);
    }
  }

  return (
    <YStack width={260} borderRightWidth={1} borderColor="$borderColor" padding="$3" gap="$2">
      <Text fontWeight="bold" fontSize="$5">
        Lists
      </Text>

      {lists.map((list) => (
        <XStack key={list.id} gap="$2" alignItems="center">
          {editingId === list.id ? (
            <Input
              flex={1}
              value={editingName}
              onChangeText={setEditingName}
              onSubmitEditing={() => handleRename(list)}
              autoFocus
            />
          ) : (
            <Button
              flex={1}
              chromeless
              justifyContent="flex-start"
              theme={selectedListId === list.id ? "active" : undefined}
              onPress={() => setSelectedListId(list.id)}
            >
              {list.type === "checklist" ? "☑ " : "☐ "}
              {list.name}
            </Button>
          )}

          {editingId === list.id ? (
            <Button size="$2" onPress={() => handleRename(list)}>
              Save
            </Button>
          ) : (
            <>
              <Button
                size="$2"
                chromeless
                onPress={() => {
                  setEditingId(list.id);
                  setEditingName(list.name);
                }}
              >
                ✎
              </Button>
              <Button size="$2" chromeless onPress={() => setSharingListId(list.id)}>
                ⇪
              </Button>
              <Button
                size="$2"
                chromeless
                theme="red"
                disabled={lists.length <= 1}
                onPress={() => handleDeleteClick(list)}
              >
                {confirmingDeleteId === list.id ? "Confirm?" : "✕"}
              </Button>
            </>
          )}
        </XStack>
      ))}

      <YStack gap="$2" marginTop="$2">
        <Input
          placeholder="New list name..."
          value={newListName}
          onChangeText={setNewListName}
          onSubmitEditing={handleCreate}
        />

        <XStack gap="$2">
          <Button
            flex={1}
            size="$2"
            theme={newListType === "todo" ? "active" : undefined}
            onPress={() => setNewListType("todo")}
          >
            Todo
          </Button>
          <Button
            flex={1}
            size="$2"
            theme={newListType === "checklist" ? "active" : undefined}
            onPress={() => setNewListType("checklist")}
          >
            Checklist
          </Button>
        </XStack>

        <Button onPress={handleCreate}>Create</Button>
      </YStack>

      {sharingListId ? (
        <ShareSettings
          list={lists.find((l) => l.id === sharingListId)!}
          onClose={() => setSharingListId(null)}
        />
      ) : null}
    </YStack>
  );
}
