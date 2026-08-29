import {
  useMutation,
  useQueryClient,
  type MutationKey,
  type QueryKey,
} from "@tanstack/react-query";

import { cancelListQuery, invalidateList } from "./infiniteCache";
import { getFlatListCache, setFlatListCache } from "./flatListCache";

export type FlatListMutationConfig<TItem, TVariables> = {
  mutationKey: MutationKey;
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<unknown>;
  updateItems: (items: TItem[], variables: TVariables) => TItem[];
};

export function useOptimisticFlatListMutation<TItem, TVariables>(
  config: FlatListMutationConfig<TItem, TVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: config.mutationKey,
    mutationFn: config.mutationFn,

    async onMutate(variables: TVariables) {
      await cancelListQuery(queryClient, config.queryKey);

      const previousItems = getFlatListCache<TItem>(queryClient, config.queryKey);

      setFlatListCache(queryClient, config.queryKey, config.updateItems(previousItems, variables));

      return { previousItems };
    },

    onError(_error, _variables, context) {
      if (!context) return;
      setFlatListCache(queryClient, config.queryKey, context.previousItems);
    },

    onSettled() {
      invalidateList(queryClient, config.queryKey);
    },
  });
}
