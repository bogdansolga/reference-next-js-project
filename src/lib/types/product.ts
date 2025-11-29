import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  sectionId: z.number().int().positive("Section ID is required"),
});

export const updateProductSchema = createProductSchema.partial();

export const productResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  sectionId: z.number(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
