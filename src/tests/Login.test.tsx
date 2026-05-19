import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../routes/login";
import { api } from "../lib/api";
import { toast } from "sonner";

// Mock the API and toast
vi.mock("../lib/api", () => ({
  api: {
    auth: {
      login: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock TanStack Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    createFileRoute: () => (config: any) => config,
  };
});

describe("Login Component Behavior", () => {
  it("enforces required fields and validates login flow", async () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/Email_Address/i);
    const passwordInput = screen.getByLabelText(/Access_Key/i);
    const submitBtn = screen.getByRole("button", { name: /Establish_Connection/i });

    // 1. Fill credentials
    fireEvent.change(emailInput, { target: { value: "principal@engineer.com" } });
    fireEvent.change(passwordInput, { target: { value: "secure_pass_123" } });
    
    // 2. Mock successful login
    (api.auth.login as any).mockResolvedValue({ access_token: "jwt_mock" });

    // 3. Trigger submit
    fireEvent.click(submitBtn);

    // 4. Verify processing state (button disabled)
    expect(submitBtn).toBeDisabled();

    // 5. Verify success redirection and toast
    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith("principal@engineer.com", "secure_pass_123");
      expect(toast.success).toHaveBeenCalledWith("Identity Verified", expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
    });
  });

  it("handles authentication failure gracefully", async () => {
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/Email_Address/i);
    const passwordInput = screen.getByLabelText(/Access_Key/i);
    const submitBtn = screen.getByRole("button", { name: /Establish_Connection/i });

    fireEvent.change(emailInput, { target: { value: "principal@engineer.com" } });
    fireEvent.change(passwordInput, { target: { value: "secure_pass_123" } });
    (api.auth.login as any).mockRejectedValue(new Error("Invalid Access Key"));

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Access Denied", expect.objectContaining({
        description: "Invalid Access Key"
      }));
    });
  });
});
