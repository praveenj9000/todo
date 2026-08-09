import { Text, View } from "react-native";

import { List } from "./List";
import type { AsyncListProps } from "./types";

function DefaultLoading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text>Loading…</Text>
    </View>
  );
}

function DefaultError({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
      <Text>Something went wrong.</Text>
      <Text onPress={onRetry} style={{ textDecorationLine: "underline" }}>
        Retry
      </Text>
    </View>
  );
}

function DefaultEmpty() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text>Nothing here yet.</Text>
    </View>
  );
}

export function AsyncList<T>(props: AsyncListProps<T>) {
  const {
    items,
    isPending,
    isError,
    onRetry,
    keyExtractor,
    renderItem,
    dragSort,
    onReorder,
    activationDistance,
    renderLoading,
    renderError,
    renderEmpty,
    estimateItemSize,
    overscan,
    pagination,
  } = props;

  if (isPending) {
    return renderLoading ? <>{renderLoading()}</> : <DefaultLoading />;
  }

  if (isError) {
    return renderError ? <>{renderError(onRetry)}</> : <DefaultError onRetry={onRetry} />;
  }

  if (!items.length) {
    return renderEmpty ? <>{renderEmpty()}</> : <DefaultEmpty />;
  }

  const shared = {
    data: items,
    keyExtractor,
    renderItem,
    dragSort,
    onReorder,
    activationDistance,
    estimateItemSize,
    overscan,
  };

  if (pagination === "paged") {
    return (
      <List<T>
        {...shared}
        pagination="paged"
        page={props.page}
        totalPages={props.totalPages}
        totalCount={props.totalCount}
        pageSize={props.pageSize}
        onPageChange={props.onPageChange}
        onPageSizeChange={props.onPageSizeChange}
        isFetchingNextPage={props.isFetching}
      />
    );
  }

  if (pagination === "infiniteScroll") {
    return (
      <List<T>
        {...shared}
        pagination="infiniteScroll"
        onEndReached={props.onEndReached}
        onEndReachedThreshold={props.onEndReachedThreshold}
        hasNextPage={props.hasNextPage}
        isFetchingNextPage={props.isFetchingNextPage}
      />
    );
  }

  return <List<T> {...shared} pagination="none" />;
}
