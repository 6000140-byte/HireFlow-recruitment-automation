import { z } from "zod";

export const candidateSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  position: z.string().min(2, "Position is required"),
  department: z.string().min(2, "Department is required"),
  education: z.string().min(2, "Education is required"),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  skills: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) return val;
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  resume_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  salary_expectation: z.string().optional(),
  availability: z.string().optional(),
  status: z.enum([
    "New",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Offer Sent",
    "Offer Accepted",
    "Offer Rejected",
    "Rejected",
    "On Hold",
    "Withdrawn",
  ]).default("New"),
});

export const overrideScoreSchema = z.object({
  score: z.number().min(0).max(100, "Score must be between 0 and 100"),
  recommendation: z.enum(["Strongly Recommended", "Recommended", "Review Required", "Not Recommended"]),
  reason: z.string().min(10, "A justification of at least 10 characters is required for score overrides"),
});
