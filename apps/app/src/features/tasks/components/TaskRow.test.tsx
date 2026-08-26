import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { renderWithProviders } from "@/test/renderWithProviders";

import { TaskRow } from "./TaskRow";
import type { Task } from "../types/task";

const baseTask: Task = {
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

describe("TaskRow", () => {
  it("renders the task title", () => {
    renderWithProviders(<TaskRow task={baseTask} onToggleCompleted={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });

  it("shows an empty circle when incomplete, a checkmark when completed", () => {
    const { rerender } = renderWithProviders(
      <TaskRow task={baseTask} onToggleCompleted={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("○")).toBeInTheDocument();

    rerender(
      <TaskRow
        task={{ ...baseTask, completed: true }}
        onToggleCompleted={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("calls onToggleCompleted when the status button is pressed", () => {
    const onToggleCompleted = vi.fn();

    renderWithProviders(
      <TaskRow task={baseTask} onToggleCompleted={onToggleCompleted} onDelete={vi.fn()} />,
    );

    fireEvent.click(screen.getByText("○"));

    expect(onToggleCompleted).toHaveBeenCalledTimes(1);
  });

  it("calls onDelete when the delete button is pressed", () => {
    const onDelete = vi.fn();

    renderWithProviders(
      <TaskRow task={baseTask} onToggleCompleted={vi.fn()} onDelete={onDelete} />,
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("does not render a drag handle when DragHandle is omitted", () => {
    renderWithProviders(<TaskRow task={baseTask} onToggleCompleted={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.queryByText("☰")).not.toBeInTheDocument();
  });

  it("renders the drag handle when DragHandle is provided", () => {
    function FakeHandle({ children }: PropsWithChildren) {
      return <div data-testid="fake-handle">{children}</div>;
    }

    renderWithProviders(
      <TaskRow
        task={baseTask}
        onToggleCompleted={vi.fn()}
        onDelete={vi.fn()}
        DragHandle={FakeHandle}
      />,
    );

    expect(screen.getByTestId("fake-handle")).toBeInTheDocument();
    expect(screen.getByText("☰")).toBeInTheDocument();
  });
});
