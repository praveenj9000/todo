import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";

import type {
  SortableListProps,
} from "./types";

import { SortableItemContextProvider } from "./SortableItem.native";

export function SortableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  activationDistance = 8,
  onEndReached,
  onEndReachedThreshold,
}: SortableListProps<T>) {
  return (
    <DraggableFlatList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={keyExtractor}
      activationDistance={activationDistance}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      renderItem={({
        item,
        drag,
      }: RenderItemParams<T>) => (
        <SortableItemContextProvider
          drag={drag}
        >
          <ScaleDecorator>
            {renderItem(item)}
          </ScaleDecorator>
        </SortableItemContextProvider>
      )}
      onDragEnd={({ data: reordered, from, to }) => {
        if (from === to) {
          return;
        }

        const movedItem = reordered[to];
        const prevItem = reordered[to - 1];
        const nextItem = reordered[to + 1];

        onReorder(
          {
            itemId: keyExtractor(movedItem),
            prevId: prevItem ? keyExtractor(prevItem) : null,
            nextId: nextItem ? keyExtractor(nextItem) : null,
          },
          reordered,
        );
      }}
    />
  );
}