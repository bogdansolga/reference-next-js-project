import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sections = sqliteTable("sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  price: real("price").notNull(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id),
});

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
