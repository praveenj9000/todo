import { useState } from "react";

import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/renderWithProviders";

import { EmailMembersInput } from "./EmailMembersInput";

function ControlledInput() {
  const [values, setValues] = useState<string[]>([]);

  return <EmailMembersInput values={values} onChange={setValues} />;
}

describe("EmailMembersInput", () => {
  it("adds a valid email as a chip when typed followed by a comma", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<ControlledInput />);

    const input = screen.getByLabelText("Member email");
    await user.type(input, "alice@example.com,");

    expect(screen.getByText("alice@example.com")).toBeTruthy();
    expect(input).toHaveValue("");
  });

  it("adds a valid email via the Add button", async () => {
    const user = userEvent.setup({ delay: null });
    const onChange = vi.fn();

    renderWithProviders(<EmailMembersInput values={[]} onChange={onChange} />);

    await user.type(screen.getByLabelText("Member email"), "bob@example.com");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(onChange).toHaveBeenCalledWith(["bob@example.com"]);
  });

  it("normalizes emails to lowercase and trims whitespace", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<ControlledInput />);

    await user.type(screen.getByLabelText("Member email"), "  Alice@Example.COM ,");

    expect(screen.getByText("alice@example.com")).toBeTruthy();
  });

  it("does not add an invalid email and surfaces an error", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<ControlledInput />);

    await user.type(screen.getByLabelText("Member email"), "not-an-email,");

    expect(screen.queryByText("not-an-email")).toBeNull();
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
  });

  it("rejects duplicates and keeps the list unchanged", async () => {
    const user = userEvent.setup({ delay: null });

    renderWithProviders(<ControlledInput />);

    await user.type(screen.getByLabelText("Member email"), "a@b.com,");
    expect(screen.getAllByText("a@b.com")).toHaveLength(1);

    await user.type(screen.getByLabelText("Member email"), "a@b.com,");

    expect(screen.getAllByText("a@b.com")).toHaveLength(1);
    expect(screen.getByText("That email is already in the list.")).toBeTruthy();
  });

  it("removes a chip when its close button is pressed", () => {
    const onChange = vi.fn();

    renderWithProviders(<EmailMembersInput values={["alice@example.com"]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove alice@example.com" }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("removes the last chip with Backspace on an empty draft", () => {
    const onChange = vi.fn();

    renderWithProviders(<EmailMembersInput values={["a@b.com", "c@d.com"]} onChange={onChange} />);

    fireEvent.keyDown(screen.getByLabelText("Member email"), { key: "Backspace" });

    expect(onChange).toHaveBeenCalledWith(["a@b.com"]);
  });
});
