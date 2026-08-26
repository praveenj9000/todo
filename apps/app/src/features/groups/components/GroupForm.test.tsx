import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/renderWithProviders";

import { GroupForm } from "./GroupForm";

import type { GroupWithMembers } from "../types/group";

const createMock = vi.fn();
const updateMock = vi.fn();

vi.mock("../hooks/useCreateGroup", () => ({
  useCreateGroup: () => ({ mutate: createMock, isPending: false }),
}));

vi.mock("../hooks/useUpdateGroup", () => ({
  useUpdateGroup: () => ({ mutate: updateMock, isPending: false }),
}));

const existingGroup: GroupWithMembers = {
  id: "group-1",
  owner_id: "user-1",
  name: "Engineering",
  created_at: "2026-08-26T00:00:00.000Z",
  updated_at: "2026-08-26T00:00:00.000Z",
  group_members: [
    {
      id: "member-1",
      group_id: "group-1",
      email: "alice@example.com",
      created_at: "2026-08-26T00:00:00.000Z",
    },
  ],
};

describe("GroupForm", () => {
  beforeEach(() => {
    createMock.mockClear();
    updateMock.mockClear();
  });

  it("creates a group with its name and member emails", async () => {
    const user = userEvent.setup({ delay: null });
    const onSaved = vi.fn();

    renderWithProviders(<GroupForm onCancel={() => {}} onSaved={onSaved} />);

    await user.type(screen.getByLabelText("Group name"), "Design");
    await user.type(screen.getByLabelText("Member email"), "bob@example.com,");

    fireEvent.click(screen.getByRole("button", { name: "Create group" }));

    expect(createMock).toHaveBeenCalledWith(
      { name: "Design", memberEmails: ["bob@example.com"] },
      expect.objectContaining({ onSuccess: onSaved }),
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("prefills the form and updates the group when editing", async () => {
    const user = userEvent.setup({ delay: null });
    const onSaved = vi.fn();

    renderWithProviders(
      <GroupForm initial={existingGroup} onCancel={() => {}} onSaved={onSaved} />,
    );

    expect(screen.getByLabelText("Group name")).toHaveValue("Engineering");
    expect(screen.getByText("alice@example.com")).toBeTruthy();

    await user.type(screen.getByLabelText("Member email"), "carol@example.com,");

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateMock).toHaveBeenCalledWith(
      {
        id: "group-1",
        input: { name: "Engineering", memberEmails: ["alice@example.com", "carol@example.com"] },
      },
      expect.objectContaining({ onSuccess: onSaved }),
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it("requires a group name before saving", async () => {
    renderWithProviders(<GroupForm onCancel={() => {}} onSaved={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Create group" }));

    expect(screen.getByText("Group name is required.")).toBeTruthy();
    expect(createMock).not.toHaveBeenCalled();
  });
});
