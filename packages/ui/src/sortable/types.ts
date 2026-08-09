import type { ReactNode } from "react";

export type ReorderResult = {
  itemId: string;
  prevId: string | null;
  nextId: string | null;
};

export type SortableListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  onReorder: (result: ReorderResult, items: T[]) => void;

  activationDistance?: number;

  /** Called when the list is scrolled near its end. Omit to disable infinite scroll entirely. */
  onEndReached?: () => void;
  /**
   * Meaning differs per platform: on native, a fraction (0-1) of the
   * visible list length (react-native's FlatList convention). On web,
   * a pixel margin before the sentinel enters the viewport.
   */
  onEndReachedThreshold?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
};

export type SortableItemProps = {
  id: string;
  children: ReactNode;
};

export type SortableHandleProps = {
  children: ReactNode;
};
