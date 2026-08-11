import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/renderWithProviders";

import { TaskFilters } from "./TaskFilters";
import { useTasksStore } from "../stores/tasks-ui.store";

describe("TaskFilters", () => {
  beforeEach(() => {
    useTasksStore.setState({ filter: "all" });
  });

  it("renders all three filter options", () => {
    renderWithProviders(<TaskFilters />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("updates the store when a filter is clicked", () => {
    renderWithProviders(<TaskFilters />);

    fireEvent.click(screen.getByText("Active"));

    expect(useTasksStore.getState().filter).toBe("active");
  });

  it("resets the page to 1 when the filter changes", () => {
    useTasksStore.setState({ filter: "all", page: 5 });

    renderWithProviders(<TaskFilters />);

    fireEvent.click(screen.getByText("Completed"));

    expect(useTasksStore.getState().page).toBe(1);
  });
});
