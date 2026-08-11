import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestQueryClient, TestQueryProvider } from "@/test/queryClientWrapper";

import { TASKS_QUERY_KEY } from "../constants/query-keys";
import { useTasksStore } from "../stores/tasks-ui.store";
import type { Task, TasksOffsetPage } from "../types/task";

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
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("useDeleteTask — paged mode optimistic cache", () => {
  beforeEach(() => {
    useTasksStore.setState({ filter: "all", sort: "manual", page: 1, pageSize: 20 });
  });

  it("removes the task from the paged cache", async () => {
    const client = createTestQueryClient();
    const pagedQueryKey = [...TASKS_QUERY_KEY, "paged", "all", "manual", 1, 20];

    client.setQueryData<TasksOffsetPage>(pagedQueryKey, {
      tasks: [existingTask],
      totalCount: 1,
    });

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: ({ children }) => <TestQueryProvider client={client}>{children}</TestQueryProvider>,
    });

    result.current.mutate("1");

    await waitFor(() => {
      const cache = client.getQueryData<TasksOffsetPage>(pagedQueryKey);
      expect(cache?.tasks).toHaveLength(0);
    });
  });
});
