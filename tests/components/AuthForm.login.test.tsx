import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignInWithEmailAndPassword = vi.hoisted(() => vi.fn());
const mockCreateUserWithEmailAndPassword = vi.hoisted(() => vi.fn());
const mockUpdateProfile = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  createUserWithEmailAndPassword: mockCreateUserWithEmailAndPassword,
  updateProfile: mockUpdateProfile,
}));

vi.mock("firebase/firestore", () => ({
  setDoc: vi.fn(),
  doc: vi.fn(() => ({})),
}));

vi.mock("@/lib/firebase", () => ({
  default: {},
  auth: {},
  db: {},
}));

vi.mock("@/lib/generateCodename", () => ({
  generateCodename: vi.fn(() => "TestCodename"),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import AuthForm from "@/components/AuthForm";

describe("AuthForm — login", () => {
  beforeEach(() => {
    mockSignInWithEmailAndPassword.mockReset();
    mockPush.mockReset();
  });

  async function fillAndSubmit(
    email = "thief@heist.com",
    password = "stapler123",
  ) {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: /log in/i }));
  }

  it("calls signInWithEmailAndPassword with email and password", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({});
    await fillAndSubmit();
    await waitFor(() =>
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "thief@heist.com",
        "stapler123",
      ),
    );
  });

  it("shows a success message after a successful sign-in", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({});
    await fillAndSubmit();
    await waitFor(() =>
      expect(screen.getByText("You're logged in!")).toBeInTheDocument(),
    );
  });

  it("shows a human-readable error for auth/invalid-credential", async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({
      code: "auth/invalid-credential",
    });
    await fillAndSubmit();
    await waitFor(() =>
      expect(
        screen.getByText("Invalid email or password."),
      ).toBeInTheDocument(),
    );
  });

  it("disables the submit button while the request is in flight", async () => {
    let resolveSignIn!: (v: unknown) => void;
    mockSignInWithEmailAndPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText("Email"), "thief@heist.com");
    await user.type(screen.getByLabelText("Password"), "stapler123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();

    await act(async () => {
      resolveSignIn({});
    });
  });
});
