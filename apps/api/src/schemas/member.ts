import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().optional(),
  role: z.string().min(2, "Role is required"),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  phone: z.string().optional(),
  gmail: z.string().optional(),
  address: z.string().optional(),
  department: z.string().optional(),
  classification: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  membershipType: z.string().optional(),
  membershipApplication: z.boolean().optional().default(false),
  gdprConsent: z.boolean().optional().default(false),
  membershipValidity: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  joinedAt: z.string().optional(),
  recruitmentId: z.string().optional(),
  active: z.boolean().default(true),
});

export const updateMemberSchema = createMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
