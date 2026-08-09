import {
  useMutation,
  useQueryClient,
  type MutationKey,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";

import {
  cancelListQuery,
  flattenInfiniteCache,
  getInfiniteCache,
  invalidateList,
  setInfiniteCacheItems,
} from "./infiniteCache";

import type { EntityWithId, PageAccessor } from "./types";

export type ListMutationConfig<TItem extends EntityWithId, TPage, TPageParam, TVariables> = {
  mutationKey: MutationKey;
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<unknown>;
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
    mutationKey: config.mutationKey,
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

export type MutationDefaultsConfig<TVariables> = {
  mutationKey: MutationKey;
  mutationFn: (variables: TVariables) => Promise<unknown>;
  /** Broad key prefix to invalidate once a resumed mutation settles, reconciling with server truth. No precise rollback is attempted here — see note above on why. */
  invalidateKey: QueryKey;
};

/**
 * Registers a mutation's implementation globally on the QueryClient, so it
 * can be resumed after a full app restart — not just while the original
 * component that called useMutation() is still mounted.
 *
 * Must be called synchronously, before the persisted client finishes
 * rehydrating (e.g. right after creating the QueryClient, at module scope —
 * not inside a React effect that could race with restoration).
 */
export function registerListMutationDefaults<TVariables>(
  queryClient: QueryClient,
  config: MutationDefaultsConfig<TVariables>,
) {
  queryClient.setMutationDefaults(config.mutationKey, {
    mutationFn: config.mutationFn,
    onSettled: () => {
      invalidateList(queryClient, config.invalidateKey);
    },
  });
}
