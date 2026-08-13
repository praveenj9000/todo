import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/renderWithProviders";

import { RegisterForm } from "./RegisterForm";

const registerMock = vi.fn();

vi.mock("../api/client", () => ({
  register: (...args: unknown[]) => registerMock(...args),
}));

describe("RegisterForm", () => {
  it("calls register with the entered email and password", async () => {
    const user = userEvent.setup({ delay: null });
    registerMock.mockResolvedValue({ error: null });

    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByPlaceholderText("Email"), "new@test.com");
    await user.type(screen.getByPlaceholderText("Password"), "hunter2");

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith("new@test.com", "hunter2");
    });
  });

  it("shows the error message returned by register", async () => {
    registerMock.mockResolvedValue({ error: { message: "Email already in use" } });

    renderWithProviders(<RegisterForm />);

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("disables the button while submitting", async () => {
    let resolveRegister: (value: { error: null }) => void;

    registerMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      }),
    );

    renderWithProviders(<RegisterForm />);

    fireEvent.click(screen.getByText("Register"));

    expect(screen.getByText("Creating account...")).toBeInTheDocument();

    resolveRegister!({ error: null });

    await waitFor(() => {
      expect(screen.getByText("Register")).toBeInTheDocument();
    });
  });
});
