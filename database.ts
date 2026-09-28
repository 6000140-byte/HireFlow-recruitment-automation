import { UserProfile, Organization } from './auth';
import { Candidate, CandidateNote, ScoringCriterion, CandidateCriterionScore, ApplicationTimelineEvent } from './candidate';
import { EmailTemplate, EmailLog } from './email';
import { OfferLetterTemplate, OfferLetter } from './offer';

export type IntegrationProvider = 'google_sheets' | 'resend' | 'google_drive';

export interface ColumnMapping {
  sheetColumn: string;
  candidateField: keyof Candidate | 'ignore';
}

export interface IntegrationConfig {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  access_token?: string;
  refresh_token?: string;
  spreadsheet_id?: string;
  spreadsheet_url?: string;
  worksheet_name?: string;
  column_mappings?: ColumnMapping[];
  auto_sync_enabled: boolean;
  sync_frequency?: '5m' | '15m' | '1h' | 'manual';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'success' | 'error';
  last_error_message?: string;
  total_synced_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity_type: 'candidate' | 'offer_letter' | 'email' | 'criteria' | 'integration' | 'user' | 'organization';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardSummary {
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  selectedCandidates: number;
  rejectedCandidates: number;
  pendingOffers: number;
  acceptedOffers: number;
  averageScore: number;
  applicationsTrend: { date: string; count: number }[];
  statusDistribution: { status: string; count: number; color: string }[];
  scoreDistribution: { range: string; count: number }[];
  applicationsByDepartment: { department: string; count: number }[];
  applicationsBySource: { source: string; count: number }[];
  offerAcceptanceRate: {
    accepted: number;
    rejected: number;
    pending: number;
    rate: number;
  };
}
