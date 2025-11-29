import { afterAll, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { products, sections } from "@/lib/db/schema";

beforeAll(async () => {
  // Ensure clean state at start
  await db.delete(products);
  await db.delete(sections);
});

afterAll(async () => {
  // Final cleanup
  await db.delete(products);
  await db.delete(sections);
});
