import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { User } from "firebase/auth";

import AuthProvider, { useUser } from "@/context/AuthContext";

const mockOnAuthStateChanged = vi.hoisted(() => vi.fn());

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock("@/lib/firebase", () => ({
  default: {},
  auth: {},
}));

function UserDisplay() {
  const { user, isLoading } = useUser();
  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="user">{user ? (user as User).email : "null"}</div>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    mockOnAuthStateChanged.mockReset();
  });

  it("returns null user and ready state after onAuthStateChanged fires with null", () => {
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: User | null) => void) => {
        cb(null);
        return vi.fn();
      },
    );

    render(
      <AuthProvider>
        <UserDisplay />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(screen.getByTestId("loading").textContent).toBe("ready");
  });

  it("returns the user object when onAuthStateChanged fires with a user", () => {
    const mockUser = { email: "thief@heist.com" } as User;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: User | null) => void) => {
        cb(mockUser);
        return vi.fn();
      },
    );

    render(
      <AuthProvider>
        <UserDisplay />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user").textContent).toBe("thief@heist.com");
    expect(screen.getByTestId("loading").textContent).toBe("ready");
  });

  it("throws when useUser is called outside AuthProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<UserDisplay />)).toThrow(
      "useUser must be used inside AuthProvider",
    );

    consoleError.mockRestore();
  });

  it("isLoading is true before onAuthStateChanged fires and false after", async () => {
    let capturedCallback: ((u: User | null) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: User | null) => void) => {
        capturedCallback = cb;
        return vi.fn();
      },
    );

    render(
      <AuthProvider>
        <UserDisplay />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await act(async () => {
      capturedCallback!(null);
    });

    expect(screen.getByTestId("loading").textContent).toBe("ready");
  });
});
