import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseUser = vi.hoisted(() => vi.fn());
const mockReplace = vi.hoisted(() => vi.fn());

vi.mock("@/context/AuthContext", () => ({ useUser: mockUseUser }));
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

import PublicLayout from "@/app/(public)/layout";

const mockUser = { uid: "test-uid", email: "thief@heist.com" };

describe("PublicLayout", () => {
  beforeEach(() => {
    mockUseUser.mockReset();
    mockReplace.mockReset();
  });

  it("renders children when unauthenticated", () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: false });
    render(<PublicLayout>page content</PublicLayout>);
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders a spinner while auth state is loading", () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: true });
    render(<PublicLayout>page content</PublicLayout>);
    expect(screen.queryByText("page content")).not.toBeInTheDocument();
  });

  it("redirects to /heists when user is signed in", async () => {
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false });
    render(<PublicLayout>page content</PublicLayout>);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/heists"));
  });
});
