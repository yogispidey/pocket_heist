import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";

// component imports
import AuthForm from "@/components/AuthForm";

describe("AuthForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login form fields and submit button", () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show password/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders the signup form fields and submit button", () => {
    render(<AuthForm mode="signup" />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("toggles the password field between hidden and visible", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(password).toHaveAttribute("type", "password");
  });

  it("logs the credentials when the login form is submitted", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "thief@heist.com");
    await user.type(screen.getByLabelText("Password"), "stapler123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(log).toHaveBeenCalledWith({
      email: "thief@heist.com",
      password: "stapler123",
    });
  });

  it("logs the credentials when the signup form is submitted", async () => {
    const user = userEvent.setup();
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<AuthForm mode="signup" />);

    await user.type(screen.getByLabelText("Email"), "newbie@heist.com");
    await user.type(screen.getByLabelText("Password"), "riddles3pm");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(log).toHaveBeenCalledWith({
      email: "newbie@heist.com",
      password: "riddles3pm",
    });
  });

  it("links from the login form to the signup page", () => {
    render(<AuthForm mode="login" />);

    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("links from the signup form to the login page", () => {
    render(<AuthForm mode="signup" />);

    const link = screen.getByRole("link", { name: /log in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
