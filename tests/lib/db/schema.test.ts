import { describe, expect, it } from "vitest";
import { products, sections, users } from "@/lib/db/schema";

describe("sections schema", () => {
  it("should have id and name columns", () => {
    expect(sections).toBeDefined();
    expect(sections.id).toBeDefined();
    expect(sections.name).toBeDefined();
  });
});

describe("products schema", () => {
  it("should have id, name, price, and sectionId columns", () => {
    expect(products).toBeDefined();
    expect(products.id).toBeDefined();
    expect(products.name).toBeDefined();
    expect(products.price).toBeDefined();
    expect(products.sectionId).toBeDefined();
  });
});

describe("users schema", () => {
  it("should have id, username, password, and role columns", () => {
    expect(users).toBeDefined();
    expect(users.id).toBeDefined();
    expect(users.username).toBeDefined();
    expect(users.password).toBeDefined();
    expect(users.role).toBeDefined();
  });
});
