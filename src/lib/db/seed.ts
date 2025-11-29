import { logger } from "@/lib/utils/logger";
import { db } from "./index";
import { products, sections } from "./schema";

async function seed() {
  logger.debug("Seeding database...");

  // Check if sections exist (idempotent)
  const existingSections = await db.select().from(sections);
  if (existingSections.length > 0) {
    logger.debug("Database already seeded, skipping...");
    return;
  }

  // Insert sections
  const [electronics, books, clothing] = await db
    .insert(sections)
    .values([{ name: "Electronics" }, { name: "Books" }, { name: "Clothing" }])
    .returning();

  // Insert products
  await db.insert(products).values([
    { name: "Laptop", price: 999.99, sectionId: electronics.id },
    { name: "Smartphone", price: 699.99, sectionId: electronics.id },
    { name: "TypeScript Handbook", price: 29.99, sectionId: books.id },
    { name: "Clean Code", price: 39.99, sectionId: books.id },
    { name: "T-Shirt", price: 19.99, sectionId: clothing.id },
  ]);

  logger.info("Database seeding complete!");
}

seed().catch((error) => logger.error("Seed failed:", error));
