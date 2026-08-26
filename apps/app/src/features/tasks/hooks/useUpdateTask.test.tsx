import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, TestQueryProvider } from "@/test/queryClientWrapper";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksOffsetPage } from "../types/task";

vi.mock("../api/tasks", () => ({
  updateTask: vi.fn(() => new Promise(() => {})),
}));

import { useUpdateTask } from "./useUpdateTask";

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

describe("useUpdateTask — paged mode optimistic cache", () => {
  beforeEach(() => {
    useTasksStore.setState({ filter: "all", sort: "manual", page: 1, pageSize: 20 });
  });

  it("writes the update into the paged cache", async () => {
    const client = createTestQueryClient();
    const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", null, "all", "manual", 1, 20];

    client.setQueryData<TasksOffsetPage>(pagedQueryKey, {
      tasks: [existingTask],
      totalCount: 1,
    });

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: ({ children }) => <TestQueryProvider client={client}>{children}</TestQueryProvider>,
    });

    result.current.mutate({ id: "1", updates: { completed: true } });

    await waitFor(() => {
      const cache = client.getQueryData<TasksOffsetPage>(pagedQueryKey);
      expect(cache?.tasks[0].completed).toBe(true);
    });
  });
});
