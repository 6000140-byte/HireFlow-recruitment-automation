import { z } from "zod";

export const offerLetterSchema = z.object({
  candidate_id: z.string().min(1, "Candidate selection is required"),
  template_id: z.string().min(1, "Offer template selection is required"),
  job_title: z.string().min(2, "Job title is required"),
  department: z.string().min(2, "Department is required"),
  reporting_manager: z.string().min(2, "Reporting manager is required"),
  employment_type: z.string().default("Full-time"),
  work_location: z.string().default("Remote"),
  salary: z.string().min(2, "Compensation / salary is required"),
  bonus_structure: z.string().optional(),
  benefits: z.string().optional(),
  probation_period: z.string().optional(),
  working_hours: z.string().optional(),
  joining_date: z.string().min(1, "Joining date is required"),
  expiry_date: z.string().min(1, "Offer expiry date is required"),
  signatory_name: z.string().min(2, "Signatory name is required"),
  signatory_designation: z.string().min(2, "Signatory designation is required"),
});

export const candidateOfferResponseSchema = z.object({
  signature_name: z.string().min(2, "Full legal name confirmation is required for electronic signature"),
  comment: z.string().optional(),
});
