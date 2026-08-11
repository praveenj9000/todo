import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/renderWithProviders";

import { LoginForm } from "./LoginForm";

const loginMock = vi.fn();

vi.mock("../api/client", () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

describe("LoginForm", () => {
  it("calls login with the entered email and password", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ error: null });

    renderWithProviders(<LoginForm />);

    await user.type(screen.getByPlaceholderText("Email"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "hunter2");

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("test@test.com", "hunter2");
    });
  });

  it("shows the error message returned by login", async () => {
    loginMock.mockResolvedValue({ error: { message: "Invalid credentials" } });

    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("shows a fallback message if login throws", async () => {
    loginMock.mockRejectedValue(new Error("Network down"));

    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument();
    });
  });

  it("disables the button while submitting", async () => {
    let resolveLogin: (value: { error: null }) => void;

    loginMock.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByText("Login"));

    expect(screen.getByText("Signing in...")).toBeInTheDocument();

    resolveLogin!({ error: null });

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });
});
