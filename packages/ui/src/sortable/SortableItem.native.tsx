import {
  createContext,
  useContext,
} from "react";

import type {
  PropsWithChildren,
} from "react";

import type {
  SortableItemProps,
} from "./types";

type ContextValue = {
  drag: () => void;
};

const Context =
  createContext<ContextValue | null>(
    null,
  );

type ProviderProps =
  PropsWithChildren<ContextValue>;

export function SortableItemContextProvider({
  children,
  drag,
}: ProviderProps) {
  return (
    <Context.Provider
      value={{
        drag,
      }}
    >
      {children}
    </Context.Provider>
  );
}

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
  children,
}: SortableItemProps) {
  return children;
}