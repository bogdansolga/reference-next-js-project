import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { products, sections } from "@/lib/db/schema";
import { productRepository } from "@/lib/repositories/productRepository";

describe("productRepository", () => {
  let sectionId: number;

  beforeEach(async () => {
    await db.delete(products);
    await db.delete(sections);
    const [section] = await db.insert(sections).values({ name: "Electronics" }).returning();
    sectionId = section.id;
    await db.insert(products).values([
      { name: "Laptop", price: 999.99, sectionId },
      { name: "Phone", price: 499.99, sectionId },
    ]);
  });

  it("findAll returns all products", async () => {
    const result = await productRepository.findAll();
    expect(result).toHaveLength(2);
  });

  it("findById returns product when exists", async () => {
    const all = await productRepository.findAll();
    const result = await productRepository.findById(all[0].id);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Laptop");
  });

  it("create adds new product", async () => {
    const newProduct = await productRepository.create({
      name: "Tablet",
      price: 299.99,
      sectionId,
    });
    expect(newProduct.id).toBeDefined();
    expect(newProduct.name).toBe("Tablet");
  });

  it("update modifies existing product", async () => {
    const all = await productRepository.findAll();
    const updated = await productRepository.update(all[0].id, { price: 899.99 });
    expect(updated?.price).toBe(899.99);
  });

  it("delete removes product", async () => {
    const all = await productRepository.findAll();
    await productRepository.delete(all[0].id);
    const remaining = await productRepository.findAll();
    expect(remaining).toHaveLength(1);
  });
});
