import { FlatList } from "react-native";

import type { ListProps } from "./types";

export function VirtualizedList<T>({
  data,
  keyExtractor,
  renderItem,
  onEndReached,
  onEndReachedThreshold,
  overscan,
}: ListProps<T>) {
  return (
    <FlatList
      style={{ flex: 1 }}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => <>{renderItem(item)}</>}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={overscan ? Math.ceil(overscan / 6) : 7}
      removeClippedSubviews
    />
  );
}
