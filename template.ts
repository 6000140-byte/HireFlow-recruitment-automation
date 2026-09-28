import { z } from "zod";

export const emailTemplateSchema = z.object({
  name: z.string().min(2, "Template name is required"),
  template_type: z.enum([
    "application_received",
    "application_under_review",
    "shortlisted",
    "interview_invitation",
    "selection_notification",
    "rejection_notification",
    "offer_letter_email",
    "offer_reminder",
    "offer_accepted_confirmation",
    "offer_rejected_confirmation",
  ]),
  subject: z.string().min(3, "Subject line is required"),
  body: z.string().min(10, "Email body content is required"),
  enabled: z.boolean().default(true),
});

export const scoringCriterionSchema = z.object({
  name: z.string().min(2, "Criterion name is required"),
  description: z.string().min(5, "Description is required"),
  weight: z.coerce.number().min(1).max(100, "Weight must be between 1 and 100%"),
  maximum_score: z.coerce.number().min(1).default(100),
  minimum_requirement: z.string().optional(),
  enabled: z.boolean().default(true),
});
