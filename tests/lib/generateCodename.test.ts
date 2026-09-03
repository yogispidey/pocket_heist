import { describe, it, expect } from "vitest";
import { generateCodename } from "@/lib/generateCodename";

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename().length).toBeGreaterThan(0);
  });

  it("returns a PascalCase string composed of three capitalised words", () => {
    const codename = generateCodename();
    expect(codename).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/);
  });
});
