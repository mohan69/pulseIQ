import { describe, expect, it } from "vitest";
import { metadata } from "@/app/app/layout";

describe("/app metadata", () => {
  it("keeps internal workbench routes out of search indexes", () => {
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});
