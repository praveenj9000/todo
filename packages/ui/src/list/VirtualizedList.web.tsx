import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useRef } from "react";

import type { ListProps } from "./types";

export function VirtualizedList<T>({
  data,
  keyExtractor,
  renderItem,
  onEndReached,
  hasNextPage,
  isFetchingNextPage,
  estimateItemSize = 64,
  overscan = 8,
}: ListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimateItemSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!onEndReached || !hasNextPage || isFetchingNextPage || !lastItem) {
      return;
    }

    if (lastItem.index >= data.length - 1) {
      onEndReached();
    }
  }, [lastItem, hasNextPage, isFetchingNextPage, data.length, onEndReached]);

  return (
    <div
      ref={scrollContainerRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const item = data[virtualRow.index];

          return (
            <div
              key={keyExtractor(item)}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
