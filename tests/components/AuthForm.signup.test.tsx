import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateUserWithEmailAndPassword = vi.hoisted(() => vi.fn());
const mockUpdateProfile = vi.hoisted(() => vi.fn());
const mockSetDoc = vi.hoisted(() => vi.fn());
const mockDoc = vi.hoisted(() => vi.fn(() => ({})));
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  updateProfile: mockUpdateProfile,
}));

vi.mock("firebase/firestore", () => ({
  setDoc: mockSetDoc,
  doc: mockDoc,
}));

vi.mock("@/lib/firebase", () => ({
  default: {},
  auth: {},
  db: {},
}));

vi.mock("@/lib/generateCodename", () => ({
  generateCodename: vi.fn(() => "SilentCrimsonFox"),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import AuthForm from "@/components/AuthForm";

const mockUser = { uid: "test-uid-123", email: "new@heist.com" };

describe("AuthForm — signup", () => {
  beforeEach(() => {
    mockCreateUserWithEmailAndPassword.mockReset();
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);
    mockPush.mockReset();
  });

  async function fillAndSubmit(
    email = "new@heist.com",
    password = "password123",
  ) {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
  }

  it("calls createUserWithEmailAndPassword with email and password", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    await fillAndSubmit();
    await waitFor(() =>
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "new@heist.com",
        "password123",
      ),
    );
  });

  it("calls updateProfile with a non-empty displayName on success", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    await fillAndSubmit();
    await waitFor(() =>
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
        displayName: "SilentCrimsonFox",
      }),
    );
  });

  it("calls setDoc with id and codename but no email", async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    await fillAndSubmit();
    await waitFor(() => {
      expect(mockSetDoc).toHaveBeenCalled();
      const data = mockSetDoc.mock.calls[0][1];
      expect(data).toEqual({
        id: "test-uid-123",
        codename: "SilentCrimsonFox",
      });
      expect(data).not.toHaveProperty("email");
    });
  });

  it("shows a human-readable error for auth/email-already-in-use", async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({
      code: "auth/email-already-in-use",
    });
    await fillAndSubmit("existing@heist.com");
    await waitFor(() =>
      expect(
        screen.getByText("An account with this email already exists."),
      ).toBeInTheDocument(),
    );
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveSignup!: (v: unknown) => void;
    mockCreateUserWithEmailAndPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignup = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await user.type(screen.getByLabelText("Email"), "new@heist.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("button", { name: /sign up/i })).toBeDisabled();

    await act(async () => {
      resolveSignup({ user: mockUser });
    });
  });
});
