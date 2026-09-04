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

import ExpiredHeistCard from "@/components/ExpiredHeistCard";

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: "heist-456",
    title: "Steal the blueprints",
    description: "Get in, get out.",
    createdBy: "uid-creator",
    createdByCodename: "The Architect",
    assignedTo: "uid-assignee",
    assignedToCodename: "Shadow Fox",
    createdAt: new Date("2026-09-01T10:00:00Z"),
    deadline: new Date("2026-09-03T17:00:00Z"),
    finalStatus: "failure",
    ...overrides,
  };
}

describe("ExpiredHeistCard", () => {
  it("renders the title as a link to /heists/[id]", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    const link = screen.getByRole("link", { name: "Steal the blueprints" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/heists/heist-456");
  });

  it("renders assignedToCodename", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText("Shadow Fox")).toBeInTheDocument();
  });

  it("renders createdByCodename", () => {
    render(<ExpiredHeistCard heist={makeHeist()} />);
    expect(screen.getByText("The Architect")).toBeInTheDocument();
  });

  it("renders a formatted deadline string", () => {
    const deadline = new Date("2026-09-03T17:00:00");
    render(<ExpiredHeistCard heist={makeHeist({ deadline })} />);
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

  it("shows FAILED badge when finalStatus is failure", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "failure" })} />);
    expect(screen.getByText("FAILED")).toBeInTheDocument();
  });

  it("shows SUCCESS badge when finalStatus is success", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: "success" })} />);
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
  });

  it("shows PENDING and does not crash when finalStatus is null", () => {
    render(<ExpiredHeistCard heist={makeHeist({ finalStatus: null })} />);
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });
});
