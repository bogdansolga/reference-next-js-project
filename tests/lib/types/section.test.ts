import { describe, expect, it } from "vitest";
import { createSectionSchema, sectionResponseSchema, updateSectionSchema } from "@/lib/types/section";

describe("section schemas", () => {
  it("sectionResponseSchema validates response", () => {
    const valid = { id: 1, name: "Electronics" };
    const result = sectionResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("createSectionSchema validates create input", () => {
    const valid = { name: "Electronics" };
    const result = createSectionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("createSectionSchema rejects empty name", () => {
    const invalid = { name: "" };
    const result = createSectionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("updateSectionSchema validates update input", () => {
    const valid = { name: "Updated" };
    const result = updateSectionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("updateSectionSchema allows empty object", () => {
    const valid = {};
    const result = updateSectionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
