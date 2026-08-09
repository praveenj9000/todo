import type { QueryClient, QueryKey } from "@tanstack/react-query";

import type { EntityWithId, PageAccessor } from "./types";

export function setPagedCacheItems<TItem extends EntityWithId, TPage>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  items: TItem[],
  accessor: PageAccessor<TPage, TItem>,
) {
  queryClient.setQueryData<TPage>(queryKey, (previous) =>
    previous ? accessor.withItems(previous, items) : previous,
  );
}
