import { describe, expect, it } from "vitest";
import { formatCount } from "@/lib/utils";

describe("formatCount", () => {
  it("uses singular labels for one source and one fact", () => {
    expect(formatCount(1, "source")).toBe("1 source");
    expect(formatCount(1, "extracted fact")).toBe("1 extracted fact");
  });

  it("uses plural labels for zero or multiple sources and facts", () => {
    expect(formatCount(0, "source")).toBe("0 sources");
    expect(formatCount(4, "source")).toBe("4 sources");
    expect(formatCount(6, "extracted fact")).toBe("6 extracted facts");
  });
});
