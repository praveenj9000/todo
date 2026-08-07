import type { ReactNode } from "react";

import type { ReorderResult } from "../sortable/types";

export type { ReorderResult };

export type PaginationMode = "none" | "infiniteScroll" | "paged";

export type ListProps<T> = {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;

  dragSort?: boolean;
  onReorder?: (result: ReorderResult, items: T[]) => void;
  activationDistance?: number;

  pagination?: PaginationMode;

  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;

  page?: number;
  totalPages?: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  estimateItemSize?: number;
  overscan?: number;
};

type AsyncListCommon<T> = {
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;

  dragSort?: boolean;
  onReorder?: (result: ReorderResult, items: T[]) => void;
  activationDistance?: number;

  items: T[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;

  renderLoading?: () => ReactNode;
  renderError?: (retry: () => void) => ReactNode;
  renderEmpty?: () => ReactNode;

  estimateItemSize?: number;
  overscan?: number;
};

export type AsyncListProps<T> = AsyncListCommon<T> &
  (
    | { pagination: "none" }
    | {
        pagination: "infiniteScroll";
        onEndReached?: () => void;
        onEndReachedThreshold?: number;
        hasNextPage?: boolean;
        isFetchingNextPage?: boolean;
      }
    | {
        pagination: "paged";
        page: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
        onPageChange: (page: number) => void;
        onPageSizeChange?: (size: number) => void;
        isFetching?: boolean;
      }
  );