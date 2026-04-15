import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3, "Název musí mít alespoň 3 znaky"),
  slug: z.string().min(3, "Slug musí mít alespoň 3 znaky"),
  description: z.string().min(1, "Popis je povinný"),
  location: z.string().min(1, "Lokace je povinná"),
  startDate: z.string(),
  endDate: z.string(),
  coverImage: z.string().optional().nullable(),
  specialStatus: z.enum(["cancelled", "postponed"]).optional().nullable(),
  eventType: z.enum(["launch", "test", "recruitment", "pr", "event"]).default("event"),
  published: z.boolean().optional().default(false),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
