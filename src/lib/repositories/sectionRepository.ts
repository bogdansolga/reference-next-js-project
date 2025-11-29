import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Section, sections } from "@/lib/db/schema";

export const sectionRepository = {
  async findAll(): Promise<Section[]> {
    return await db.select().from(sections);
  },

  async findById(id: number): Promise<Section | null> {
    const result = await db.select().from(sections).where(eq(sections.id, id));
    return result[0] ?? null;
  },
};
