import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/renderWithProviders";

import { AddTaskForm } from "./AddTaskForm";

const mutateMock = vi.fn();

vi.mock("../hooks/useCreateTask", () => ({
  useCreateTask: () => ({
    mutate: mutateMock,
  }),
}));

describe("AddTaskForm", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("clears the input immediately on submit, without waiting for the mutation", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AddTaskForm />);

    const input = screen.getByPlaceholderText("Add a task...");

    await user.type(input, "Buy milk");
    expect(input).toHaveValue("Buy milk");

    fireEvent.click(screen.getByText("Add"));

    // Regression test: this previously stayed populated until the
    // mutation's network call resolved (broken specifically while
    // offline, since a paused mutation never resolves until reconnect).
    expect(input).toHaveValue("");
    expect(mutateMock).toHaveBeenCalledWith({ title: "Buy milk" });
  });

  it("does not call the mutation for an empty or whitespace-only title", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AddTaskForm />);

    fireEvent.click(screen.getByText("Add"));
    expect(mutateMock).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText("Add a task...");
    await user.type(input, "   ");
    fireEvent.click(screen.getByText("Add"));

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("remains editable across multiple submissions (not permanently disabled)", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<AddTaskForm />);

    const input = screen.getByPlaceholderText("Add a task...");

    await user.type(input, "First");
    fireEvent.click(screen.getByText("Add"));

    // Regression test: this previously stayed disabled for the entire
    // duration a mutation was paused offline (bound to isPending),
    // preventing a second offline submission.
    expect(input).not.toBeDisabled();

    await user.type(input, "Second");
    fireEvent.click(screen.getByText("Add"));

    expect(mutateMock).toHaveBeenCalledTimes(2);
  });
});
