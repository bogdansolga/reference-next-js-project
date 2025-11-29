import { describe, expect, it } from "vitest";
import { createProductSchema } from "@/lib/types/product";

describe("product schemas", () => {
  it("createProductSchema validates required fields", () => {
    const valid = { name: "Test", price: 9.99, sectionId: 1 };
    const result = createProductSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("createProductSchema rejects missing name", () => {
    const invalid = { price: 9.99, sectionId: 1 };
    const result = createProductSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("createProductSchema rejects negative price", () => {
    const invalid = { name: "Test", price: -1, sectionId: 1 };
    const result = createProductSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
