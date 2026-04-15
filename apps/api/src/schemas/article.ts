import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImage: z.string().url().optional().or(z.literal("")).nullable(),
  images: z.array(z.string().url()).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().datetime("Datum publikování musí být platné datum"),
});

export const updateArticleSchema = createArticleSchema.partial();

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
