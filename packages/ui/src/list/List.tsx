import { PaginationToolbar } from "../pagination";
import { SortableList } from "../sortable";

import { VirtualizedList } from "./VirtualizedList";
import type { ListProps } from "./types";

export function List<T>(props: ListProps<T>) {
  const {
    dragSort = false,
    pagination = "none",
    onReorder,
    page = 1,
    totalPages = 1,
    totalCount = 0,
    pageSize = 20,
    onPageChange,
    onPageSizeChange,
    isFetchingNextPage,
    onEndReached,
    hasNextPage,
    ...rest
  } = props;

  const body = dragSort ? (
    <SortableList
      {...rest}
      onReorder={onReorder ?? (() => {})}
      onEndReached={pagination === "infiniteScroll" ? onEndReached : undefined}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  ) : (
    <VirtualizedList
      {...rest}
      onEndReached={pagination === "infiniteScroll" ? onEndReached : undefined}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );

  if (pagination !== "paged") {
    return body;
  }

  return (
    <>
      {body}

      <PaginationToolbar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange ?? (() => {})}
        onPageSizeChange={onPageSizeChange}
        disabled={isFetchingNextPage}
      />
    </>
  );
}