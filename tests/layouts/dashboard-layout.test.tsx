import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseUser = vi.hoisted(() => vi.fn());
const mockReplace = vi.hoisted(() => vi.fn());

vi.mock("@/context/AuthContext", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));
vi.mock("@/components/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));

import DashboardLayout from "@/app/(dashboard)/layout";

const mockUser = { uid: "test-uid", email: "thief@heist.com" };

describe("DashboardLayout", () => {
  beforeEach(() => {
    mockUseUser.mockReset();
    mockReplace.mockReset();
  });

  it("renders children and Navbar when authenticated", () => {
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false });
    render(<DashboardLayout>page content</DashboardLayout>);
    expect(screen.getByText("page content")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("renders a spinner while auth state is loading", () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true });
    render(<DashboardLayout>page content</DashboardLayout>);
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("redirects to /login when user is not signed in", async () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: false });
    render(<DashboardLayout>page content</DashboardLayout>);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/login"));
  });
});
