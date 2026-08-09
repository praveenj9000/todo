import type { PropsWithChildren } from "react";

import { Pressable } from "react-native";

import { useSortableItem } from "./SortableItem.native";

export function SortableHandle({ children }: PropsWithChildren) {
  const { drag } = useSortableItem();

  return <Pressable onLongPress={drag}>{children}</Pressable>;
}
