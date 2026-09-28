import { UserRole, PermissionCheck } from "@/types/auth";

export function getRolePermissions(role: UserRole): PermissionCheck {
  switch (role) {
    case "super_admin":
      return {
        canManageUsers: true,
        canManageSettings: true,
        canManageIntegrations: true,
        canManageCriteria: true,
        canManageTemplates: true,
        canViewApplications: true,
        canScoreCandidates: true,
        canChangeStatus: true,
        canSendEmails: true,
        canGenerateOffers: true,
        canViewReports: true,
        canAddNotes: true,
        canViewAuditLogs: true,
      };
    case "recruiter":
      return {
        canManageUsers: false,
        canManageSettings: false,
        canManageIntegrations: true,
        canManageCriteria: false,
        canManageTemplates: true,
        canViewApplications: true,
        canScoreCandidates: true,
        canChangeStatus: true,
        canSendEmails: true,
        canGenerateOffers: true,
        canViewReports: true,
        canAddNotes: true,
        canViewAuditLogs: false,
      };
    case "reviewer":
      return {
        canManageUsers: false,
        canManageSettings: false,
        canManageIntegrations: false,
        canManageCriteria: false,
        canManageTemplates: false,
        canViewApplications: true,
        canScoreCandidates: true,
        canChangeStatus: true, // can recommend/change status of assigned candidates
        canSendEmails: false,
        canGenerateOffers: false,
        canViewReports: false,
        canAddNotes: true,
        canViewAuditLogs: false,
      };
    case "viewer":
    default:
      return {
        canManageUsers: false,
        canManageSettings: false,
        canManageIntegrations: false,
        canManageCriteria: false,
        canManageTemplates: false,
        canViewApplications: true,
        canScoreCandidates: false,
        canChangeStatus: false,
        canSendEmails: false,
        canGenerateOffers: false,
        canViewReports: true,
        canAddNotes: false,
        canViewAuditLogs: false,
      };
  }
}

export function roleDisplayNames(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "recruiter":
      return "Recruiter";
    case "reviewer":
      return "Reviewer";
    case "viewer":
      return "Viewer";
    default:
      return "User";
  }
}
