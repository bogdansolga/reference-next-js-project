import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type NewSection, type Section, sections } from "@/lib/db/schema";

export const sectionRepository = {
  async findAll(): Promise<Section[]> {
    return await db.select().from(sections);
  },

  async findById(id: number): Promise<Section | null> {
    const result = await db.select().from(sections).where(eq(sections.id, id));
    return result[0] ?? null;
  },

  async create(data: NewSection): Promise<Section> {
    const [section] = await db.insert(sections).values(data).returning();
    return section;
  },

  async update(id: number, data: Partial<NewSection>): Promise<Section | null> {
    const [section] = await db.update(sections).set(data).where(eq(sections.id, id)).returning();
    return section ?? null;
  },

  async delete(id: number): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  },
};
