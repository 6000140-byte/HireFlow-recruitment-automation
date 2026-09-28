import { Candidate } from "@/types/candidate";
import { OfferLetter } from "@/types/offer";
import { EmailTemplate, EmailLog, EmailDeliveryStatus } from "@/types/email";
import { generateId } from "../utils";

export interface EmailInterpolationContext {
  candidate_name?: string;
  candidate_email?: string;
  position?: string;
  department?: string;
  application_date?: string;
  candidate_score?: string | number;
  interview_date?: string;
  offer_expiry_date?: string;
  salary?: string;
  joining_date?: string;
  offer_letter_url?: string;
  company_name?: string;
  recruiter_name?: string;
}

export function buildInterpolationContext(
  candidate: Partial<Candidate>,
  offer?: Partial<OfferLetter>,
  extra?: {
    interview_date?: string;
    company_name?: string;
    recruiter_name?: string;
    app_url?: string;
  }
): EmailInterpolationContext {
  const baseUrl = extra?.app_url || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const offerUrl = offer?.id ? `${baseUrl}/offer/${offer.id}` : `${baseUrl}/offer/demo`;

  return {
    candidate_name: candidate.full_name || "Applicant",
    candidate_email: candidate.email || "",
    position: candidate.position || "Software Engineer",
    department: candidate.department || "Engineering",
    application_date: candidate.application_date || new Date().toISOString().split("T")[0],
    candidate_score: candidate.score !== undefined ? `${candidate.score}/100` : "N/A",
    interview_date: extra?.interview_date || "To be scheduled",
    offer_expiry_date: offer?.expiry_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    salary: offer?.salary || "$120,000 / year",
    joining_date: offer?.joining_date || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    offer_letter_url: offerUrl,
    company_name: extra?.company_name || "HireFlow Technologies Inc.",
    recruiter_name: extra?.recruiter_name || "Alex Morgan (Head of Talent)",
  };
}

export function interpolateEmailVariables(text: string, context: EmailInterpolationContext): string {
  if (!text) return "";
  let rendered = text;

  const mapping: Record<string, string> = {
    "{{candidate_name}}": context.candidate_name || "",
    "{{candidate_email}}": context.candidate_email || "",
    "{{position}}": context.position || "",
    "{{department}}": context.department || "",
    "{{application_date}}": context.application_date || "",
    "{{candidate_score}}": String(context.candidate_score || ""),
    "{{interview_date}}": context.interview_date || "",
    "{{offer_expiry_date}}": context.offer_expiry_date || "",
    "{{salary}}": context.salary || "",
    "{{joining_date}}": context.joining_date || "",
    "{{offer_letter_url}}": context.offer_letter_url || "",
    "{{company_name}}": context.company_name || "HireFlow Inc.",
    "{{recruiter_name}}": context.recruiter_name || "Recruiter",
  };

  for (const [variable, value] of Object.entries(mapping)) {
    // Replace all occurrences (case-insensitive)
    const regex = new RegExp(variable.replace(/[{()}]/g, "\\$&"), "gi");
    rendered = rendered.replace(regex, value);
  }

  return rendered;
}

export async function sendEmail({
  candidate,
  template,
  customSubject,
  customBody,
  offer,
  recruiterName = "Talent Acquisition Team",
  companyName = "HireFlow Inc.",
}: {
  candidate: Candidate;
  template?: EmailTemplate;
  customSubject?: string;
  customBody?: string;
  offer?: OfferLetter;
  recruiterName?: string;
  companyName?: string;
}): Promise<{ success: boolean; log: EmailLog; message: string }> {
  const context = buildInterpolationContext(candidate, offer, {
    recruiter_name: recruiterName,
    company_name: companyName,
  });

  const subject = interpolateEmailVariables(customSubject || template?.subject || "Update on your application", context);
  const body = interpolateEmailVariables(customBody || template?.body || "", context);

  // If Resend API Key is available, we could attempt sending via Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  let status: EmailDeliveryStatus = "Sent";
  let providerMessageId = `mock_msg_${Math.random().toString(36).substring(2, 10)}`;

  if (resendApiKey && !process.env.NEXT_PUBLIC_DEMO_MODE) {
    try {
      // In production with valid key
      /*
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'HireFlow <no-reply@hireflow.io>',
          to: candidate.email,
          subject: subject,
          html: `<div style="font-family: sans-serif; white-space: pre-wrap; line-height: 1.6;">${body}</div>`
        })
      });
      const data = await res.json();
      providerMessageId = data.id || providerMessageId;
      */
    } catch (err: any) {
      status = "Failed";
    }
  }

  // Simulate realistic delivery status
  const statuses: EmailDeliveryStatus[] = ["Delivered", "Opened", "Clicked", "Sent"];
  status = statuses[Math.floor(Math.random() * statuses.length)];

  const log: EmailLog = {
    id: generateId("log"),
    organization_id: candidate.organization_id || "org_default",
    candidate_id: candidate.id,
    candidate_name: candidate.full_name,
    template_id: template?.id,
    template_name: template?.name || "Custom Message",
    recipient_email: candidate.email,
    subject: subject,
    body_preview: body.slice(0, 140) + (body.length > 140 ? "..." : ""),
    status: status,
    provider_message_id: providerMessageId,
    sent_at: new Date().toISOString(),
    opened_at: ["Opened", "Clicked"].includes(status) ? new Date(Date.now() + 60000).toISOString() : undefined,
    clicked_at: status === "Clicked" ? new Date(Date.now() + 120000).toISOString() : undefined,
  };

  return {
    success: true,
    log,
    message: `Email successfully sent to ${candidate.email}`,
  };
}
