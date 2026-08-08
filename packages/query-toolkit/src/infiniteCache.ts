import type { InfiniteData, QueryClient, QueryKey } from "@tanstack/react-query";

import type { EntityWithId, PageAccessor } from "./types";

export async function cancelListQuery(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  await queryClient.cancelQueries({ queryKey });
}

export function getInfiniteCache<TPage, TPageParam>(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  return queryClient.getQueryData<InfiniteData<TPage, TPageParam>>(queryKey);
}

export function flattenInfiniteCache<TItem extends EntityWithId, TPage>(
  data: InfiniteData<TPage, unknown> | undefined,
  accessor: PageAccessor<TPage, TItem>,
): TItem[] {
  const items = data?.pages.flatMap((page) => accessor.getItems(page)) ?? [];

  const seen = new Set<string>();
  const deduped: TItem[] = [];

  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    deduped.push(item);
  }

  return deduped;
}

export function setInfiniteCacheItems<TItem extends EntityWithId, TPage, TPageParam>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  items: TItem[],
  accessor: PageAccessor<TPage, TItem>,
  emptyPage: TPage,
  emptyPageParam: TPageParam,
) {
  queryClient.setQueryData<InfiniteData<TPage, TPageParam>>(
    queryKey,
    (previous) => {
      if (!previous) {
        return {
          pages: [accessor.withItems(emptyPage, items)],
          pageParams: [emptyPageParam],
        };
      }

      const pageSizes = previous.pages.map(
        (page) => accessor.getItems(page).length,
      );

      const pages: TPage[] = [];
      let offset = 0;

      pageSizes.forEach((size, index) => {
        const isLast = index === pageSizes.length - 1;

        const slice = isLast
          ? items.slice(offset)
          : items.slice(offset, offset + size);

        offset += size;

        pages.push(accessor.withItems(previous.pages[index], slice));
      });

      return { ...previous, pages };
    },
  );
}

export function resetInfiniteCacheToFirstPage<TPage, TPageParam>(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  queryClient.setQueryData<InfiniteData<TPage, TPageParam>>(
    queryKey,
    (previous) => {
      if (!previous || previous.pages.length === 0) {
        return previous;
      }

      return {
        pages: [previous.pages[0]],
        pageParams: [previous.pageParams[0]],
      };
    },
  );

  queryClient.invalidateQueries({ queryKey, refetchType: "active" });
}

export function invalidateList(
  queryClient: QueryClient,
  queryKey: QueryKey,
) {
  queryClient.invalidateQueries({ queryKey });
}