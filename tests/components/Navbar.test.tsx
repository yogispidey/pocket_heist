import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignOut = vi.hoisted(() => vi.fn());
const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("firebase/auth", () => ({ signOut: mockSignOut }));
vi.mock("@/lib/firebase", () => ({ default: {}, auth: {} }));
vi.mock("@/context/AuthContext", () => ({ useUser: mockUseUser }));

import Navbar from "@/components/Navbar";

const mockUser = { uid: "test-uid", email: "thief@heist.com" };

describe("Navbar", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
    mockUseUser.mockReturnValue({ user: null, isLoading: false });
  });

  it("renders the main heading", () => {
    render(<Navbar />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the Create New Heist link", () => {
    render(<Navbar />);
    const createLink = screen.getByRole("link", { name: /create new heist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/heists/create");
  });

  it("does not render the Logout button when user is null", () => {
    render(<Navbar />);
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the Logout button when user is signed in", () => {
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false });
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls signOut when Logout is clicked", async () => {
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false });
    mockSignOut.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledWith({}));
  });

  it("disables the Logout button while sign-out is in flight", async () => {
    mockUseUser.mockReturnValue({ user: mockUser, isLoading: false });
    let resolve!: () => void;
    mockSignOut.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByRole("button", { name: /logout/i })).toBeDisabled();
    resolve();
  });
});
