import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Avatar from "@/components/Avatar"

describe("Avatar", () => {
  it("renders successfully", () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByRole("img", { name: /john doe/i })).toBeInTheDocument()
  })

  it("displays the first two uppercase initials from a full name", () => {
    render(<Avatar name="Jane Smith" />)
    expect(screen.getByText("JS")).toBeInTheDocument()
  })

  it("displays a single initial when only one word is given", () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText("A")).toBeInTheDocument()
  })
})
