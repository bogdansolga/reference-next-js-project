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

  it("create adds a new section", async () => {
    const result = await sectionRepository.create({ name: "Clothing" });
    expect(result.name).toBe("Clothing");
    expect(result.id).toBeDefined();
  });

  it("update modifies an existing section", async () => {
    const all = await sectionRepository.findAll();
    const result = await sectionRepository.update(all[0].id, { name: "Updated" });
    expect(result?.name).toBe("Updated");
  });

  it("update returns null for non-existent section", async () => {
    const result = await sectionRepository.update(9999, { name: "Updated" });
    expect(result).toBeNull();
  });

  it("delete removes a section", async () => {
    const all = await sectionRepository.findAll();
    await sectionRepository.delete(all[0].id);
    const remaining = await sectionRepository.findAll();
    expect(remaining).toHaveLength(1);
  });
});
