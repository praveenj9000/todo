import { useEffect } from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { setupOnlineManager } from "@todo/query-toolkit";
import { registerListsMutationDefaults } from "@/features/lists";
import { registerGroupsMutationDefaults } from "@/features/groups";
import { registerTaskMutationDefaults } from "@/features/tasks/registerMutationDefaults";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
      gcTime: ONE_DAY_MS,
    },
  },
});

// Must run synchronously, at module scope, before the persister below has
// any chance to finish restoring — resumePausedMutations() (in onSuccess,
// further down) needs these defaults already registered or it has nothing
// to call for mutations that were paused before the app was last killed.
registerTaskMutationDefaults(queryClient);
registerListsMutationDefaults(queryClient);
registerGroupsMutationDefaults(queryClient);

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "TODO_QUERY_CACHE",
});

type Props = {
  children: ReactNode;
};

export function QueryProvider({ children }: Props) {
  useEffect(() => {
    return setupOnlineManager();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY_MS,
        buster: "v2",
        dehydrateOptions: {
          // Explicit rather than relying on the library default: only
          // paused mutations get persisted, since an in-flight (not yet
          // paused) mutation shouldn't survive a hard kill mid-request.
          shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
        },
      }}
      onSuccess={() => {
        void queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
