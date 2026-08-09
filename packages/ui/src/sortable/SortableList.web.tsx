import { useEffect, useRef } from "react";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";

import type { SortableListProps } from "./types";

export function SortableList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  activationDistance = 8,
  onEndReached,
  onEndReachedThreshold = 200,
  hasNextPage,
  isFetchingNextPage,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onEndReached || !hasNextPage) {
      return;
    }

    const container = scrollContainerRef.current;
    const sentinel = sentinelRef.current;

    if (!container || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onEndReached();
        }
      },
      {
        root: container,
        rootMargin: `${onEndReachedThreshold}px`,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onEndReached, hasNextPage, isFetchingNextPage, onEndReachedThreshold]);

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = data.findIndex((item) => keyExtractor(item) === active.id);

    const newIndex = data.findIndex((item) => keyExtractor(item) === over.id);

    const reordered = arrayMove(data, oldIndex, newIndex);

    const prevItem = reordered[newIndex - 1];
    const nextItem = reordered[newIndex + 1];

    onReorder(
      {
        itemId: String(active.id),
        prevId: prevItem ? keyExtractor(prevItem) : null,
        nextId: nextItem ? keyExtractor(nextItem) : null,
      },
      reordered,
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map(keyExtractor)} strategy={verticalListSortingStrategy}>
          {data.map(renderItem)}
        </SortableContext>

        {onEndReached ? <div ref={sentinelRef} style={{ height: 1 }} /> : null}
      </DndContext>
    </div>
  );
}
