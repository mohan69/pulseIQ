import { describe, expect, it } from "vitest";
import { formatExecutiveCurrency } from "@/lib/utils";

describe("formatExecutiveCurrency", () => {
  it("formats crore values with negative prefix", () => {
    expect(formatExecutiveCurrency(-300_000_000)).toBe("-₹30Cr")
  })

  it("formats crore values without prefix", () => {
    expect(formatExecutiveCurrency(1_200_000_000)).toBe("₹120Cr")
  })

  it("formats -7Cr correctly", () => {
    expect(formatExecutiveCurrency(-70_000_000)).toBe("-₹7Cr")
  })

  it("formats -12Cr correctly", () => {
    expect(formatExecutiveCurrency(-120_000_000)).toBe("-₹12Cr")
  })

  it("formats lakh values with one decimal and suffix", () => {
    expect(formatExecutiveCurrency(-342_857, { suffix: "/emp" })).toBe("-₹3.4L/emp")
  })

  it("formats 28.6L/emp correctly", () => {
    expect(formatExecutiveCurrency(2_857_143, { suffix: "/emp" })).toBe("₹28.6L/emp")
  })

  it("formats 150Cr target", () => {
    expect(formatExecutiveCurrency(1_500_000_000)).toBe("₹150Cr")
  })

  it("formats 25Cr target", () => {
    expect(formatExecutiveCurrency(250_000_000)).toBe("₹25Cr")
  })

  it("formats 32L target", () => {
    expect(formatExecutiveCurrency(3_200_000)).toBe("₹32L")
  })

  it("formats +6Cr (positive surplus)", () => {
    expect(formatExecutiveCurrency(60_000_000)).toBe("₹6Cr")
  })

  it("handles null/undefined/NaN", () => {
    expect(formatExecutiveCurrency(null)).toBe("—")
    expect(formatExecutiveCurrency(undefined)).toBe("—")
    expect(formatExecutiveCurrency(NaN)).toBe("—")
  })

  it("formats zero", () => {
    expect(formatExecutiveCurrency(0)).toBe("₹0")
  })

  it("formats small values with locale", () => {
    expect(formatExecutiveCurrency(50_000)).toBe("₹50,000")
  })

  it("formats small negative values", () => {
    expect(formatExecutiveCurrency(-50_000)).toBe("-₹50,000")
  })
})
