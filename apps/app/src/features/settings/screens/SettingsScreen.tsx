import { useState } from "react";
import { Button, SizableText, Tabs, YStack } from "tamagui";

import { logout } from "@/features/auth";
import { GroupsTab } from "@/features/groups";

export default function SettingsScreen() {
  const [tab, setTab] = useState<"general" | "groups">("general");

  return (
    <YStack flex={1}>
      <Tabs value={tab} onValueChange={(value) => setTab(value as "general" | "groups")}>
        <Tabs.List>
          <Tabs.Tab value="general">
            <SizableText>General</SizableText>
          </Tabs.Tab>
          <Tabs.Tab value="groups">
            <SizableText>Groups</SizableText>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Content value="general">
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Button onPress={() => logout()}>Logout</Button>
          </YStack>
        </Tabs.Content>

        <Tabs.Content value="groups">
          <GroupsTab />
        </Tabs.Content>
      </Tabs>
    </YStack>
  );
}
