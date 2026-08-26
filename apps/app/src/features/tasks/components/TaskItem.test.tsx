import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/renderWithProviders";

import { TaskItem } from "./TaskItem";
import type { Task } from "../types/task";

const updateMutateMock = vi.fn();
const deleteMutateMock = vi.fn();

vi.mock("../hooks/useUpdateTask", () => ({
  useUpdateTask: () => ({ mutateAsync: updateMutateMock }),
}));

vi.mock("../hooks/useDeleteTask", () => ({
  useDeleteTask: () => ({ mutateAsync: deleteMutateMock }),
}));

vi.mock("@todo/ui/sortable", () => ({
  SortableItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SortableHandle: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const task: Task = {
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

describe("TaskItem", () => {
  it("renders without a drag handle when draggable is false", () => {
    renderWithProviders(<TaskItem task={task} draggable={false} />);

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.queryByText("☰")).not.toBeInTheDocument();
  });

  it("renders with a drag handle when draggable is true", () => {
    renderWithProviders(<TaskItem task={task} draggable />);

    expect(screen.getByText("☰")).toBeInTheDocument();
  });

  it("calls the update mutation with toggled completion on status press", async () => {
    renderWithProviders(<TaskItem task={task} />);

    fireEvent.click(screen.getByText("○"));

    expect(updateMutateMock).toHaveBeenCalledWith({
      id: "1",
      updates: expect.objectContaining({ completed: true }),
    });
  });

  it("calls the delete mutation on delete press", () => {
    renderWithProviders(<TaskItem task={task} />);

    fireEvent.click(screen.getByText("Delete"));

    expect(deleteMutateMock).toHaveBeenCalledWith("1");
  });
});
