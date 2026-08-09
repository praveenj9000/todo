import type { PropsWithChildren } from "react";

import { useSortableItem } from "./SortableItem.web";

export function SortableHandle({ children }: PropsWithChildren) {
  const { listeners, attributes } = useSortableItem();

  return (
    <div
      {...listeners}
      {...attributes}
      style={{
        cursor: "grab",
        display: "inline-flex",
      }}
    >
      {children}
    </div>
  );
}
