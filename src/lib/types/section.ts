import { z } from "zod";

export const sectionResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type SectionResponse = z.infer<typeof sectionResponseSchema>;
