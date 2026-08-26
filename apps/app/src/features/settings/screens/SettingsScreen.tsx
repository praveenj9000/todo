import { useState } from "react";

import { Button, Text, XStack, YStack } from "tamagui";

import { logout } from "@/features/auth";
import { GroupsTab } from "@/features/groups";

type SettingsTab = "general" | "groups";

const TABS = [
  { label: "General", value: "general" },
  { label: "Groups", value: "groups" },
] as const satisfies readonly { label: string; value: SettingsTab }[];

export default function SettingsScreen() {
  const [tab, setTab] = useState<SettingsTab>("general");

  return (
    <YStack flex={1}>
      <YStack
        padding="$4"
        borderBottomWidth={1}
        borderColor="$borderColor"
        gap="$3"
        alignItems="center"
      >
        <XStack width="100%" maxWidth={640} justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="bold">
            Settings
          </Text>
          <Button onPress={() => void logout()}>Logout</Button>
        </XStack>

        <XStack width="100%" maxWidth={640} gap="$2">
          {TABS.map((item) => (
            <Button
              key={item.value}
              theme={tab === item.value ? "active" : undefined}
              onPress={() => setTab(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </XStack>
      </YStack>

      <YStack flex={1} minHeight={0}>
        {tab === "groups" ? <GroupsTab /> : null}
      </YStack>
    </YStack>
  );
}
