import { z } from "zod";

export const recruitmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  education: z.string().min(5, "Education details required"),
  experience: z.string().optional(),
  interests: z.string().min(10, "Please describe your interests"),
  motivation: z.string().min(20, "Please tell us why you want to join"),
  skills: z.string().optional(),
  availability: z.string().optional(),
  preferredRole: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  task: z.string().optional(),
});

export type RecruitmentInput = z.infer<typeof recruitmentSchema>;
