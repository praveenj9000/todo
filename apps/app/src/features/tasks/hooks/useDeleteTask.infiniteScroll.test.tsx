import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, TestQueryProvider } from "@/test/queryClientWrapper";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksCursor, TasksPage } from "../types/task";

vi.mock("@/config/features", () => ({
  FEATURES: {
    pagination: { enabled: true, pageSize: 20 },
    infiniteScroll: { enabled: true },
    dragSort: { enabled: true },
  },
}));

vi.mock("../api/tasks", () => ({
  deleteTask: vi.fn(() => new Promise(() => {})),
}));

import { useDeleteTask } from "./useDeleteTask";

const existingTask: Task = {
  id: "1",
  user_id: "user-1",
  title: "Buy milk",
  completed: false,
  completed_at: null,
  list_id: "list-1",
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("useDeleteTask — infinite-scroll mode optimistic cache", () => {
  beforeEach(() => {
    useTasksStore.setState({ filter: "all", sort: "manual", page: 1, pageSize: 20 });
  });

  it("removes the task from the scroll cache, not the paged cache", async () => {
    const client = createTestQueryClient();
    const scrollQueryKey = [...TASKS_QUERY_KEY, null, "all", "manual"];

    client.setQueryData<{ pages: TasksPage[]; pageParams: (TasksCursor | null)[] }>(
      scrollQueryKey,
      {
        pages: [{ tasks: [existingTask], nextCursor: null }],
        pageParams: [null],
      },
    );

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: ({ children }) => <TestQueryProvider client={client}>{children}</TestQueryProvider>,
    });

    result.current.mutate("1");

    await waitFor(() => {
      const cache = client.getQueryData<{ pages: TasksPage[] }>(scrollQueryKey);
      expect(cache?.pages[0].tasks).toHaveLength(0);
    });

    const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", null, "all", "manual", 1, 20];
    expect(client.getQueryData(pagedQueryKey)).toBeUndefined();
  });
});
