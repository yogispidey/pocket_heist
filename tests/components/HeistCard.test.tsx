import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { Heist } from "@/types/firestore";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import HeistCard from "@/components/HeistCard";

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "heist-123",
    title: "Swap the Keyboards",
    description: "Every vowel key must move.",
    createdBy: "uid-creator",
    createdByCodename: "The Architect",
    assignedTo: "uid-assignee",
    assignedToCodename: "Shadow Fox",
    createdAt: new Date("2026-09-01T10:00:00Z"),
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    finalStatus: null,
    ...overrides,
  };
}

describe("HeistCard", () => {
  it("renders the title as a link to /heists/[id]", () => {
    render(<HeistCard heist={makeHeist()} />);
    const link = screen.getByRole("link", { name: "Swap the Keyboards" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/heists/heist-123");
  });

  it("renders assignedToCodename in the To: row", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("Shadow Fox")).toBeInTheDocument();
  });

  it("renders createdByCodename in the By: row", () => {
    render(<HeistCard heist={makeHeist()} />);
    expect(screen.getByText("The Architect")).toBeInTheDocument();
  });

  it("renders a formatted deadline date", () => {
    const deadline = new Date("2026-12-05T17:00:00");
    render(<HeistCard heist={makeHeist({ deadline })} />);
    const formatted = deadline.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    expect(
      screen.getByText(
        new RegExp(formatted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      ),
    ).toBeInTheDocument();
  });

  it("shows Overdue when deadline is in the past", () => {
    const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);
    render(<HeistCard heist={makeHeist({ deadline: pastDeadline })} />);
    expect(screen.getByText(/Overdue/)).toBeInTheDocument();
  });

  it("does not show Overdue when deadline is in the future", () => {
    const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    render(<HeistCard heist={makeHeist({ deadline: futureDeadline })} />);
    expect(screen.queryByText(/Overdue/)).not.toBeInTheDocument();
  });
});
