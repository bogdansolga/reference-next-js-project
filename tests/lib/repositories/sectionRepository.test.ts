import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { products, sections } from "@/lib/db/schema";
import { sectionRepository } from "@/lib/repositories/sectionRepository";

describe("sectionRepository", () => {
  beforeEach(async () => {
    await db.delete(products);
    await db.delete(sections);
    await db.insert(sections).values([{ name: "Electronics" }, { name: "Books" }]);
  });

  it("findAll returns all sections", async () => {
    const result = await sectionRepository.findAll();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Electronics");
  });

  it("findById returns section when exists", async () => {
    const all = await sectionRepository.findAll();
    const result = await sectionRepository.findById(all[0].id);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Electronics");
  });

  it("findById returns null when not exists", async () => {
    const result = await sectionRepository.findById(9999);
    expect(result).toBeNull();
  });
});
