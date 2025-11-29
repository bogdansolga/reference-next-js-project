import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewProduct, type Product, products } from "@/lib/db/schema";

export const productRepository = {
  async findAll(): Promise<Product[]> {
    return await db.select().from(products);
  },

  async findById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] ?? null;
  },

  async create(data: NewProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },

  async update(id: number, data: Partial<NewProduct>): Promise<Product | null> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product ?? null;
  },

  async delete(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  },
};
