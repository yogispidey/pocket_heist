import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOnSnapshot = vi.hoisted(() => vi.fn());
const mockQuery = vi.hoisted(() => vi.fn((...args: unknown[]) => args));
const mockWhere = vi.hoisted(() => vi.fn((...args: unknown[]) => args));
const mockCollection = vi.hoisted(() =>
  vi.fn(() => ({ withConverter: vi.fn((c) => c) })),
);
const mockTimestampNow = vi.hoisted(() =>
  vi.fn(() => ({ toMillis: () => Date.now() })),
);
const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("firebase/firestore", () => ({
  onSnapshot: mockOnSnapshot,
  query: mockQuery,
  where: mockWhere,
  collection: mockCollection,
  Timestamp: { now: mockTimestampNow },
}));

vi.mock("@/lib/firebase", () => ({
  default: {},
  db: {},
}));

vi.mock("@/context/AuthContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("@/types/firestore", () => ({
  COLLECTIONS: { HEISTS: "heists", USERS: "users" },
  heistConverter: {},
}));

import { useHeists } from "@/hooks/useHeists";

const MOCK_USER = { uid: "user-123", displayName: "Shadow Fox" };

const MOCK_HEISTS = [
  {
    id: "h1",
    title: "Swap the Keyboards",
    deadline: new Date(Date.now() + 10000),
    finalStatus: null,
  } as any,
  {
    id: "h2",
    title: "Hide the Stapler",
    deadline: new Date(Date.now() + 20000),
    finalStatus: null,
  } as any,
];

function HookDisplay({ mode }: { mode: "active" | "assigned" | "expired" }) {
  const { heists, isLoading, error } = useHeists(mode);
  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "ready"}</div>
      <div data-testid="error">{error ?? "none"}</div>
      <ul>
        {heists.map((h) => (
          <li key={h.id}>{h.title}</li>
        ))}
      </ul>
    </div>
  );
}

describe("useHeists", () => {
  beforeEach(() => {
    mockOnSnapshot.mockReset();
    mockQuery.mockReset();
    mockWhere.mockReset();
    mockQuery.mockImplementation((...args: unknown[]) => args);
    mockWhere.mockImplementation((...args: unknown[]) => args);
    mockUseUser.mockReturnValue({ user: MOCK_USER });
  });

  it("returns isLoading:true and empty heists before first snapshot", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<HookDisplay mode="active" />);
    expect(screen.getByTestId("loading").textContent).toBe("loading");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("returns heists once the snapshot fires", async () => {
    let capturedCallback: ((snap: unknown) => void) | null = null;
    mockOnSnapshot.mockImplementation(
      (_q: unknown, cb: (snap: unknown) => void) => {
        capturedCallback = cb;
        return vi.fn();
      },
    );

    render(<HookDisplay mode="active" />);

    await act(async () => {
      capturedCallback!({ docs: MOCK_HEISTS.map((h) => ({ data: () => h })) });
    });

    expect(screen.getByTestId("loading").textContent).toBe("ready");
    expect(screen.getByText("Swap the Keyboards")).toBeInTheDocument();
    expect(screen.getByText("Hide the Stapler")).toBeInTheDocument();
  });

  it("builds a query with assignedTo and deadline for 'active' mode", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<HookDisplay mode="active" />);

    const whereCalls = mockWhere.mock.calls;
    expect(whereCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["assignedTo", "==", MOCK_USER.uid]),
        expect.arrayContaining(["deadline", ">="]),
      ]),
    );
  });

  it("builds a query with createdBy and deadline for 'assigned' mode", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<HookDisplay mode="assigned" />);

    const whereCalls = mockWhere.mock.calls;
    expect(whereCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["createdBy", "==", MOCK_USER.uid]),
        expect.arrayContaining(["deadline", ">="]),
      ]),
    );
  });

  it("builds a query with deadline and finalStatus for 'expired' mode (no user filter)", () => {
    mockOnSnapshot.mockReturnValue(vi.fn());
    render(<HookDisplay mode="expired" />);

    const whereCalls = mockWhere.mock.calls;
    expect(whereCalls).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["deadline", "<"]),
        expect.arrayContaining(["finalStatus", "in"]),
      ]),
    );
    // No uid-based where clause
    const hasUserFilter = whereCalls.some((call) => call[2] === MOCK_USER.uid);
    expect(hasUserFilter).toBe(false);
  });

  it("sets error when the snapshot listener receives an error", async () => {
    let capturedError: ((err: Error) => void) | null = null;
    mockOnSnapshot.mockImplementation(
      (_q: unknown, _cb: unknown, errCb: (err: Error) => void) => {
        capturedError = errCb;
        return vi.fn();
      },
    );

    render(<HookDisplay mode="active" />);

    await act(async () => {
      capturedError!(new Error("Firestore error"));
    });

    expect(screen.getByTestId("error").textContent).toBe(
      "Failed to load heists.",
    );
    expect(screen.getByTestId("loading").textContent).toBe("ready");
  });

  it("calls the unsubscribe function on unmount", () => {
    const mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<HookDisplay mode="active" />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});
