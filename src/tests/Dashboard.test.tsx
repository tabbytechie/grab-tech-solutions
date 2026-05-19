import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../routes/dashboard/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "../lib/api";

// Mock TanStack Router
vi.mock("@tanstack/react-router", () => ({
  useNavigate: vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  createFileRoute: () => (config: any) => config,
}));

// Mock the API library
vi.mock("../lib/api", () => ({
  api: {
    tasks: {
      list: vi.fn(),
    },
    auth: {
      logout: vi.fn(),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("Dashboard Component State Machine", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("renders skeleton state during initial fetching", () => {
    (api.tasks.list as any).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<Dashboard />, { wrapper });
    
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders active data state after successful fetch", async () => {
    const mockTasks = [
      { id: "task-1", status: "completed", priority: 5, created_at: new Date().toISOString() },
    ];
    (api.tasks.list as any).mockResolvedValue({ payload: mockTasks });

    render(<Dashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/task-1/i)).toBeInTheDocument();
      // Target the Badge specifically to avoid conflict with the Select option
      expect(screen.getByText("Completed", { selector: ".bg-green-500\\/80" })).toBeInTheDocument();
    });
  });

  it("filters tasks correctly based on search term and status", async () => {
    const mockTasks = [
      { id: "alpha-task", status: "completed", priority: 1, created_at: new Date().toISOString() },
      { id: "beta-task", status: "failed", priority: 2, created_at: new Date().toISOString() },
    ];
    (api.tasks.list as any).mockResolvedValue({ payload: mockTasks });

    render(<Dashboard />, { wrapper });

    // Use a function matcher because the ID is split into two spans
    const findTaskId = (id: string) => screen.findByText((content, element) => {
      const hasText = (node: Element) => node.textContent === id;
      const elementHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    });

    await waitFor(async () => expect(await findTaskId("alpha-task")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search by Task ID.../i);
    const statusSelect = screen.getByRole("combobox");

    // 1. Filter by Search
    fireEvent.change(searchInput, { target: { value: "beta" } });
    expect(screen.queryByText(/alpha-ta/i)).not.toBeInTheDocument();
    expect(await findTaskId("beta-task")).toBeInTheDocument();

    // 2. Filter by Status
    fireEvent.change(searchInput, { target: { value: "" } });
    fireEvent.change(statusSelect, { target: { value: "completed" } });
    expect(await findTaskId("alpha-task")).toBeInTheDocument();
    expect(screen.queryByText(/beta-tas/i)).not.toBeInTheDocument();
  });

  it("renders error state on API failure", async () => {
    (api.tasks.list as any).mockRejectedValue(new Error("Network Partition"));

    render(<Dashboard />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("System_Failure")).toBeInTheDocument();
      expect(screen.getByText("Error: Network Partition")).toBeInTheDocument();
    });
  });

  it("disables sign out button during simulated processing", async () => {
    let resolveLogout: () => void;
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });

    (api.tasks.list as any).mockResolvedValue({ payload: [] });
    (api.auth.logout as any).mockReturnValue(logoutPromise);

    render(<Dashboard />, { wrapper });

    const signOutBtn = screen.getByText("Sign_Out");
    expect(signOutBtn).not.toBeDisabled();

    fireEvent.click(signOutBtn);
    await waitFor(() => expect(signOutBtn).toBeDisabled());

    resolveLogout!();
  });
});
