import { describe, expect, it } from "vitest";
import { sectionResponseSchema } from "@/lib/types/section";

describe("section schemas", () => {
  it("sectionResponseSchema validates response", () => {
    const valid = { id: 1, name: "Electronics" };
    const result = sectionResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
