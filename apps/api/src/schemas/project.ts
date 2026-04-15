import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  slug: z.string().min(2, "Slug musí mít alespoň 2 znaky"),
  description: z.string().min(1, "Popis je povinný"),
  category: z.string().optional().nullable(),
  status: z.enum(["planning", "development", "testing", "completed"]).default("planning"),
  startDate: z.string().optional().nullable(),
  completionDate: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  specs: z.record(z.string(), z.any()).optional().nullable(),
  published: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
