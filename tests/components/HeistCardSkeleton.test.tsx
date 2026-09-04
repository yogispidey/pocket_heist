import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import HeistCardSkeleton from "@/components/HeistCardSkeleton";

describe("HeistCardSkeleton", () => {
  it("renders without errors", () => {
    const { container } = render(<HeistCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders pulse placeholder elements", () => {
    const { container } = render(<HeistCardSkeleton />);
    const pulseElements = container.querySelectorAll("[class*='pulse']");
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
