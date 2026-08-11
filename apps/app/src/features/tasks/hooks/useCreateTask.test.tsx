import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, TestQueryProvider } from "@/test/queryClientWrapper";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { TasksOffsetPage } from "../types/task";

vi.mock("../api/tasks", () => ({
  createTask: vi.fn(() => new Promise(() => {})), // never resolves — isolates the optimistic write
}));

import { useCreateTask } from "./useCreateTask";

describe("useCreateTask — paged mode optimistic cache", () => {
  beforeEach(() => {
    useTasksStore.setState({
      filter: "all",
      sort: "manual",
      page: 1,
      pageSize: 20,
    });
  });

  it("writes the optimistic task into the paged cache, not just the infinite-scroll cache", async () => {
    const client = createTestQueryClient();

    const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", "all", "manual", 1, 20];

    client.setQueryData<TasksOffsetPage>(pagedQueryKey, {
      tasks: [],
      totalCount: 0,
    });

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: ({ children }) => <TestQueryProvider client={client}>{children}</TestQueryProvider>,
    });

    result.current.mutate({ title: "New task" });

    await waitFor(() => {
      const cache = client.getQueryData<TasksOffsetPage>(pagedQueryKey);
      expect(cache?.tasks).toHaveLength(1);
    });

    const cache = client.getQueryData<TasksOffsetPage>(pagedQueryKey);
    expect(cache?.tasks[0].title).toBe("New task");

    // This is the actual regression: before the fix, this hook wrote
    // unconditionally to the infinite-scroll cache key, which nothing
    // in paged mode reads — a silent no-op.
    const scrollQueryKey = [...TASKS_QUERY_KEY, "all", "manual"];
    const scrollCache = client.getQueryData(scrollQueryKey);
    expect(scrollCache).toBeUndefined();
  });
});
