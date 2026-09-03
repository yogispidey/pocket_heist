import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAddDoc = vi.hoisted(() => vi.fn());
const mockGetDocs = vi.hoisted(() => vi.fn());
const mockCollection = vi.hoisted(() =>
  vi.fn(() => ({ withConverter: vi.fn((c) => c) })),
);
const mockServerTimestamp = vi.hoisted(() => vi.fn(() => "SERVER_TIMESTAMP"));
const mockTimestampFromMillis = vi.hoisted(() =>
  vi.fn((ms: number) => ({ toMillis: () => ms })),
);
const mockPush = vi.hoisted(() => vi.fn());
const mockUseUser = vi.hoisted(() => vi.fn());

vi.mock("firebase/firestore", () => ({
  addDoc: mockAddDoc,
  getDocs: mockGetDocs,
  collection: mockCollection,
  serverTimestamp: mockServerTimestamp,
  Timestamp: { fromMillis: mockTimestampFromMillis },
}));

vi.mock("@/lib/firebase", () => ({
  default: {},
  db: {},
}));

vi.mock("@/context/AuthContext", () => ({
  useUser: mockUseUser,
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

vi.mock("@/types/firestore", () => ({
  COLLECTIONS: { HEISTS: "heists", USERS: "users" },
  userConverter: {},
}));

const MOCK_USERS = [
  { id: "uid-1", codename: "Shadow Fox" },
  { id: "uid-2", codename: "Iron Rook" },
];

function makeSnapshot(users: typeof MOCK_USERS) {
  return {
    docs: users.map((u) => ({ data: () => u })),
  };
}

import CreateHeistForm from "@/components/CreateHeistForm";

describe("CreateHeistForm", () => {
  beforeEach(() => {
    mockAddDoc.mockReset();
    mockGetDocs.mockReset();
    mockPush.mockReset();
    mockTimestampFromMillis.mockReset();
    mockGetDocs.mockResolvedValue(makeSnapshot(MOCK_USERS));
    mockUseUser.mockReturnValue({
      user: { uid: "creator-uid", displayName: "The Architect" },
    });
    mockTimestampFromMillis.mockImplementation((ms: number) => ({
      toMillis: () => ms,
    }));
  });

  it("renders Title, Description, and Assign To fields", async () => {
    render(<CreateHeistForm />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("Assign to")).toBeInTheDocument(),
    );
  });

  it("populates the Assign To dropdown with users fetched from Firestore", async () => {
    render(<CreateHeistForm />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("option", { name: "Iron Rook" }),
    ).toBeInTheDocument();
  });

  it("calls addDoc with correct fields on submit", async () => {
    mockAddDoc.mockResolvedValue({});
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Swap the Keyboards");
    await user.type(
      screen.getByLabelText("Description"),
      "Every vowel key must move.",
    );
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());

    const payload = mockAddDoc.mock.calls[0][1];
    expect(payload.title).toBe("Swap the Keyboards");
    expect(payload.description).toBe("Every vowel key must move.");
    expect(payload.createdBy).toBe("creator-uid");
    expect(payload.createdByCodename).toBe("The Architect");
    expect(payload.assignedTo).toBe("uid-1");
    expect(payload.assignedToCodename).toBe("Shadow Fox");
    expect(payload.finalStatus).toBeNull();
  });

  it("passes a deadline Timestamp approximately 48h from now", async () => {
    mockAddDoc.mockResolvedValue({});
    const before = Date.now();
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "The Stapler Job");
    await user.type(
      screen.getByLabelText("Description"),
      "Hide it on the top shelf.",
    );
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());

    const ms = mockTimestampFromMillis.mock.calls[0][0] as number;
    const fortyEightH = 48 * 60 * 60 * 1000;
    expect(ms).toBeGreaterThanOrEqual(before + fortyEightH);
    expect(ms).toBeLessThan(before + fortyEightH + 5000);
  });

  it("calls router.push('/heists') after successful submit", async () => {
    mockAddDoc.mockResolvedValue({});
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Riddle Me This");
    await user.type(
      screen.getByLabelText("Description"),
      "Speak only in riddles.",
    );
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/heists"));
  });

  it("shows an error message when addDoc rejects", async () => {
    mockAddDoc.mockRejectedValue(new Error("Firestore error"));
    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "The Big One");
    await user.type(screen.getByLabelText("Description"), "Go big or go home.");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeInTheDocument(),
    );
  });

  it("disables the submit button while submission is in flight", async () => {
    let resolveAdd!: (v: unknown) => void;
    mockAddDoc.mockReturnValue(
      new Promise((resolve) => {
        resolveAdd = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<CreateHeistForm />);

    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Shadow Fox" }),
      ).toBeInTheDocument(),
    );

    await user.type(screen.getByLabelText("Title"), "Slow Burn");
    await user.type(screen.getByLabelText("Description"), "Takes a while.");
    await user.click(screen.getByRole("button", { name: /create heist/i }));

    expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();

    await act(async () => {
      resolveAdd({});
    });
  });
});
