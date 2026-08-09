import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import {
  cancelListQuery,
  flattenInfiniteCache,
  getInfiniteCache,
  invalidateList,
  setInfiniteCacheItems,
} from "./infiniteCache";

import type { EntityWithId, PageAccessor } from "./types";

export type ListMutationConfig<TItem extends EntityWithId, TPage, TPageParam, TVariables> = {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<unknown>;
  /** Given the current flattened item list and the mutation's variables, return the new item list — this is the only entity-specific piece. */
  updateItems: (items: TItem[], variables: TVariables) => TItem[];
  accessor: PageAccessor<TPage, TItem>;
  emptyPage: TPage;
  emptyPageParam: TPageParam;
};

export function useOptimisticListMutation<
  TItem extends EntityWithId,
  TPage,
  TPageParam,
  TVariables,
>(config: ListMutationConfig<TItem, TPage, TPageParam, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: config.mutationFn,

    async onMutate(variables: TVariables) {
      await cancelListQuery(queryClient, config.queryKey);

      const previousItems = flattenInfiniteCache(
        getInfiniteCache<TPage, TPageParam>(queryClient, config.queryKey),
        config.accessor,
      );

      setInfiniteCacheItems(
        queryClient,
        config.queryKey,
        config.updateItems(previousItems, variables),
        config.accessor,
        config.emptyPage,
        config.emptyPageParam,
      );

      return { previousItems };
    },

    onError(_error, _variables, context) {
      if (!context) {
        return;
      }

      setInfiniteCacheItems(
        queryClient,
        config.queryKey,
        context.previousItems,
        config.accessor,
        config.emptyPage,
        config.emptyPageParam,
      );
    },

    onSettled() {
      invalidateList(queryClient, config.queryKey);
    },
  });
}
