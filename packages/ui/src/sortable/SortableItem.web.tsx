import {
  createContext,
  useContext,
} from "react";

import type {
  PropsWithChildren,
} from "react";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import type {
  SortableItemProps,
} from "./types";

type ContextValue = ReturnType<
  typeof useSortable
>;

const Context =
  createContext<ContextValue | null>(
    null,
  );

export function useSortableItem() {
  const context =
    useContext(Context);

  if (!context) {
    throw new Error(
      "SortableItem must be inside SortableList.",
    );
  }

  return context;
}

export function SortableItem({
  id,
  children,
}: SortableItemProps) {
  const sortable =
    useSortable({
      id,
    });

  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  return (
    <Context.Provider
      value={sortable}
    >
      <div
        ref={setNodeRef}
        style={{
          transform:
            CSS.Transform.toString(
              transform,
            ),
          transition,
          opacity: isDragging
            ? 0.5
            : 1,
            touchAction: "none",
        }}
      >
        {children}
      </div>
    </Context.Provider>
  );
}