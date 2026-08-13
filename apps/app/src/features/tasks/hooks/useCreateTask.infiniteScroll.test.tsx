import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, TestQueryProvider } from "@/test/queryClientWrapper";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { TasksCursor, TasksPage } from "../types/task";

vi.mock("@/config/features", () => ({
  FEATURES: {
    pagination: { enabled: true, pageSize: 20 },
    infiniteScroll: { enabled: true },
    dragSort: { enabled: true },
  },
}));

vi.mock("../api/tasks", () => ({
  createTask: vi.fn(() => new Promise(() => {})), // never resolves — isolates the optimistic write
}));

import { useCreateTask } from "./useCreateTask";

describe("useCreateTask — infinite-scroll mode optimistic cache", () => {
  beforeEach(() => {
    useTasksStore.setState({
      filter: "all",
      sort: "manual",
      page: 1,
      pageSize: 20,
    });
  });

  it("writes the optimistic task into the scroll cache, not the paged cache", async () => {
    const client = createTestQueryClient();

    const scrollQueryKey = [...TASKS_QUERY_KEY, "all", "manual"];

    client.setQueryData<{ pages: TasksPage[]; pageParams: (TasksCursor | null)[] }>(
      scrollQueryKey,
      {
        pages: [{ tasks: [], nextCursor: null }],
        pageParams: [null],
      },
    );

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: ({ children }) => <TestQueryProvider client={client}>{children}</TestQueryProvider>,
    });

    result.current.mutate({ title: "New task" });

    await waitFor(() => {
      const cache = client.getQueryData<{ pages: TasksPage[] }>(scrollQueryKey);
      expect(cache?.pages[0].tasks).toHaveLength(1);
    });

    const cache = client.getQueryData<{ pages: TasksPage[] }>(scrollQueryKey);
    expect(cache?.pages[0].tasks[0].title).toBe("New task");

    // This is the actual regression this test guards against: in
    // infinite-scroll mode, the optimistic write must NOT go to the
    // paged cache key — nothing in this mode reads from it.
    const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", "all", "manual", 1, 20];
    expect(client.getQueryData(pagedQueryKey)).toBeUndefined();
  });
});
