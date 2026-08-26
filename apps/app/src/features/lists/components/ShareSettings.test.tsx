import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/renderWithProviders";

import { ShareSettings } from "./ShareSettings";

import type { GroupWithMembers } from "@/features/groups/types/group";
import type { List } from "../types/list";
import type { ListShare } from "../types/share";

const { addShare, changePermission, removeShare, setPublicAccess, shares, groups } = vi.hoisted(
  () => ({
    addShare: vi.fn(),
    changePermission: vi.fn(),
    removeShare: vi.fn(),
    setPublicAccess: vi.fn(),
    shares: [] as ListShare[],
    groups: [] as GroupWithMembers[],
  }),
);

vi.mock("../hooks/useListShares", () => ({
  useListShares: () => ({ data: shares }),
}));

vi.mock("../hooks/useShareMutations", () => ({
  useShareMutations: () => ({
    addShare: { mutate: addShare },
    changePermission: { mutate: changePermission },
    removeShare: { mutate: removeShare },
    setPublicAccess: { mutate: setPublicAccess },
  }),
}));

vi.mock("@/features/groups/hooks/useGroups", () => ({
  useGroups: () => ({ data: groups }),
}));

const list = {
  id: "list-1",
  name: "Packing list",
  user_id: "user-1",
  type: "todo",
  share_token: "tok-1",
  public_read: false,
  public_edit: false,
  created_at: "2026-08-26T00:00:00.000Z",
  updated_at: "2026-08-26T00:00:00.000Z",
} as List;

const familyGroup: GroupWithMembers = {
  id: "group-1",
  name: "Family",
  owner_id: "user-1",
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

const groupShare: ListShare = {
  id: "share-1",
  list_id: "list-1",
  subject_type: "group",
  subject_id: "group-1",
  permission: "read",
  created_at: "2026-08-26T00:00:00.000Z",
};

describe("ShareSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    shares.length = 0;
    groups.length = 0;
  });

  it("shows existing group shares by group name", () => {
    shares.push(groupShare);
    groups.push(familyGroup);

    renderWithProviders(<ShareSettings list={list} onClose={() => {}} />);

    expect(screen.getByText(/Family/)).toBeTruthy();
    // The already-shared group is removed from the "add" choices.
    expect(screen.getByText("Every group is already shared on this list.")).toBeTruthy();
  });

  it("adds a user share with the selected permission", () => {
    renderWithProviders(<ShareSettings list={list} onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("User ID"), { target: { value: "user-2" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(addShare).toHaveBeenCalledWith({
      subjectType: "user",
      subjectId: "user-2",
      permission: "read",
    });
  });

  it("adds a group share with read permission", () => {
    groups.push(familyGroup);

    renderWithProviders(<ShareSettings list={list} onClose={() => {}} />);

    const addGroupButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.trim() === "Add (read)");

    expect(addGroupButton).toBeTruthy();
    fireEvent.click(addGroupButton!);

    expect(addShare).toHaveBeenCalledWith({
      subjectType: "group",
      subjectId: "group-1",
      permission: "read",
    });
  });

  it("shows an empty hint when the owner has no groups", () => {
    renderWithProviders(<ShareSettings list={list} onClose={() => {}} />);

    expect(screen.getByText(/No groups yet/)).toBeTruthy();
    expect(screen.getByText(/Create one in Settings . Groups, then share it here\./)).toBeTruthy();
  });
});
