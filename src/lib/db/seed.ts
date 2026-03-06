import { db } from "./index";
import { products, sections, users } from "./schema";

async function seed() {
  // Check if sections exist (idempotent)
  const existingSections = await db.select().from(sections);
  if (existingSections.length === 0) {
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
  }

  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      { username: "user", password: "user", role: "USER" },
      { username: "admin", password: "admin", role: "ADMIN" },
    ]);
  }

  console.info("Database seeded");
}

seed().catch(console.error);
