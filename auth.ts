export type UserRole = 'super_admin' | 'recruiter' | 'reviewer' | 'viewer';

export interface UserProfile {
  id: string;
  user_id: string;
  organization_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionCheck {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageIntegrations: boolean;
  canManageCriteria: boolean;
  canManageTemplates: boolean;
  canViewApplications: boolean;
  canScoreCandidates: boolean;
  canChangeStatus: boolean;
  canSendEmails: boolean;
  canGenerateOffers: boolean;
  canViewReports: boolean;
  canAddNotes: boolean;
  canViewAuditLogs: boolean;
}
