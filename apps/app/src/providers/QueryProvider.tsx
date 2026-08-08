import { useEffect } from "react";
import type { ReactNode } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { setupOnlineManager } from "@todo/query-toolkit";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60,
      // Must be >= the persister's maxAge below, or persisted queries
      // get garbage-collected from memory before they're ever written to disk.
      gcTime: ONE_DAY_MS,
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "TODO_QUERY_CACHE",
});

type Props = {
  children: ReactNode;
};

export function QueryProvider({
  children,
}: Props) {
  useEffect(() => {
    return setupOnlineManager();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY_MS,
        // Bump this if the cached shape of a query ever changes
        // incompatibly (e.g. TasksPage gains a required field) —
        // it invalidates old persisted caches instead of crashing on them.
        buster: "v1",
      }}
      onSuccess={() => {
        // Paused mutations from earlier in this same app session (not
        // ones from a prior, now-killed session — see Layer B note)
        // resume automatically once the persisted cache finishes
        // restoring and the QueryClient is ready.
        void queryClient.resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}