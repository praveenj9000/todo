import type { QueryClient, QueryKey } from "@tanstack/react-query";

export function getFlatListCache<TItem>(queryClient: QueryClient, queryKey: QueryKey): TItem[] {
  return queryClient.getQueryData<TItem[]>(queryKey) ?? [];
}

export function setFlatListCache<TItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  items: TItem[],
) {
  queryClient.setQueryData<TItem[]>(queryKey, items);
}
