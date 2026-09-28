export type EmailTemplateType =
  | 'application_received'
  | 'application_under_review'
  | 'shortlisted'
  | 'interview_invitation'
  | 'selection_notification'
  | 'rejection_notification'
  | 'offer_letter_email'
  | 'offer_reminder'
  | 'offer_accepted_confirmation'
  | 'offer_rejected_confirmation';

export type EmailDeliveryStatus =
  | 'Sent'
  | 'Delivered'
  | 'Opened'
  | 'Clicked'
  | 'Failed'
  | 'Bounced';

export interface EmailTemplate {
  id: string;
  organization_id: string;
  name: string;
  template_type: EmailTemplateType;
  subject: string;
  body: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  organization_id: string;
  candidate_id: string;
  candidate_name?: string;
  template_id?: string;
  template_name?: string;
  recipient_email: string;
  subject: string;
  body_preview?: string;
  status: EmailDeliveryStatus;
  provider_message_id?: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
}
