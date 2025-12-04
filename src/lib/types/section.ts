import { z } from "zod";

export const sectionResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const createSectionSchema = z.object({
  name: z.string().min(1),
});

export const updateSectionSchema = z.object({
  name: z.string().min(1).optional(),
});

export type SectionResponse = z.infer<typeof sectionResponseSchema>;
export type CreateSectionDto = z.infer<typeof createSectionSchema>;
export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;
